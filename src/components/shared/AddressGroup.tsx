import { useEffect, useRef } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin } from 'lucide-react'

interface AddressGroupProps {
  prefix: string
  form: UseFormReturn<any>
  isMapsLoaded: boolean
  title: string
  disabled?: boolean
  onAddressChanged?: () => void
}

export function AddressGroup({
  prefix,
  form,
  isMapsLoaded,
  title,
  disabled,
  onAddressChanged,
}: AddressGroupProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const numRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isMapsLoaded || !inputRef.current || disabled) return
    try {
      const autocomplete = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'br' },
        fields: ['address_components', 'geometry'],
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (!place.geometry) return

        let street = '',
          neighborhood = '',
          city = '',
          state = '',
          cep = ''
        place.address_components?.forEach((c: any) => {
          if (c.types.includes('route')) street = c.long_name
          if (c.types.includes('sublocality_level_1') || c.types.includes('sublocality'))
            neighborhood = c.long_name
          if (c.types.includes('administrative_area_level_2')) city = c.long_name
          if (c.types.includes('administrative_area_level_1')) state = c.short_name
          if (c.types.includes('postal_code')) cep = c.long_name
        })

        form.setValue(`${prefix}_street`, street, { shouldValidate: true })
        form.setValue(`${prefix}_neighborhood`, neighborhood, { shouldValidate: true })
        form.setValue(`${prefix}_city`, city, { shouldValidate: true })
        form.setValue(`${prefix}_state`, state, { shouldValidate: true })
        form.setValue(`${prefix}_cep`, cep, { shouldValidate: true })
        form.setValue(`lat_${prefix}`, place.geometry.location.lat())
        form.setValue(`lng_${prefix}`, place.geometry.location.lng())

        if (onAddressChanged) onAddressChanged()

        setTimeout(() => {
          numRef.current?.focus()
        }, 100)
      })
    } catch (error) {
      console.error('Google Maps Autocomplete Error:', error)
    }
  }, [isMapsLoaded, prefix, form, disabled, onAddressChanged])

  const { ref: regRef, ...regRest } = form.register(`${prefix}_street`)
  const { ref: numRegRef, ...numRegRest } = form.register(`${prefix}_number`)

  return (
    <div className="space-y-4 p-4 border rounded-md bg-card shadow-sm border-primary/10">
      <h4 className="font-semibold text-sm flex items-center gap-2 text-primary uppercase tracking-wider mb-2 border-b pb-2">
        <MapPin className="w-4 h-4" /> {title}
      </h4>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-9 space-y-1">
          <Label>Endereço / Rua (Busca Automática)</Label>
          <Input
            {...regRest}
            ref={(e) => {
              regRef(e)
              inputRef.current = e
            }}
            disabled={disabled}
            placeholder="Digite para buscar rua e bairro..."
            className="border-primary/20 focus-visible:ring-primary bg-background"
          />
        </div>
        <div className="col-span-12 md:col-span-3 space-y-1">
          <Label>
            Número <span className="text-destructive">*</span>
          </Label>
          <Input
            {...numRegRest}
            ref={(e) => {
              numRegRef(e)
              numRef.current = e
            }}
            disabled={disabled}
            className="bg-background"
          />
        </div>
        <div className="col-span-12 md:col-span-5 space-y-1">
          <Label>Bairro</Label>
          <Input
            {...form.register(`${prefix}_neighborhood`)}
            disabled={disabled}
            className="bg-background"
          />
        </div>
        <div className="col-span-12 md:col-span-4 space-y-1">
          <Label>Cidade</Label>
          <Input
            {...form.register(`${prefix}_city`)}
            disabled={disabled}
            className="bg-background"
          />
        </div>
        <div className="col-span-6 md:col-span-1 space-y-1">
          <Label>UF</Label>
          <Input
            {...form.register(`${prefix}_state`)}
            disabled={disabled}
            maxLength={2}
            className="bg-background"
          />
        </div>
        <div className="col-span-6 md:col-span-2 space-y-1">
          <Label>CEP</Label>
          <Input
            {...form.register(`${prefix}_cep`)}
            disabled={disabled}
            className="bg-background"
          />
        </div>
      </div>
    </div>
  )
}
