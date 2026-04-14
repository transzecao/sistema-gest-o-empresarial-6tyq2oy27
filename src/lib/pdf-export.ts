export const exportQuotationPdf = (quote: any, breakdown: any, user: any) => {
  const content = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; line-height: 1.5;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #800020; padding-bottom: 20px; margin-bottom: 20px;">
        <div>
          <h1 style="color: #800020; margin: 0; font-size: 28px; letter-spacing: -1px;">TRANSZECÃO</h1>
          <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Logística & Transportes</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; color: #555; font-size: 20px;">Cotação de Frete</h2>
          <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 16px; color: #800020;">${quote.codigo || quote.id}</p>
        </div>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px;">
        <div>
          <p style="margin: 4px 0;"><b>Data da Emissão:</b> ${new Date(quote.created || Date.now()).toLocaleString()}</p>
          <p style="margin: 4px 0;"><b>Emissor:</b> ${user?.name || 'Sistema Integrado'}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 4px 0;"><b>Status:</b> ${quote.status ? quote.status.toUpperCase() : 'GERADA'}</p>
          <p style="margin: 4px 0;"><b>Cluster Aplicado:</b> ${quote.cluster || 'N/A'}</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
        <tr style="background-color: #f4f4f5;">
          <th style="padding: 12px; text-align: left; border: 1px solid #ddd; width: 50%;">Local de Origem</th>
          <th style="padding: 12px; text-align: left; border: 1px solid #ddd; width: 50%;">Local de Destino</th>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #ddd; vertical-align: top;">
            <p style="margin: 0 0 8px 0; font-weight: bold;">CNPJ: ${quote.cnpj_remetente}</p>
            <p style="margin: 0; color: #555;">${quote.endereco_remetente}</p>
          </td>
          <td style="padding: 12px; border: 1px solid #ddd; vertical-align: top;">
            <p style="margin: 0 0 8px 0; font-weight: bold;">CNPJ: ${quote.cnpj_destinatario}</p>
            <p style="margin: 0; color: #555;">${quote.endereco_destinatario}</p>
          </td>
        </tr>
      </table>

      <h3 style="color: #800020; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; font-size: 16px;">Detalhes da Carga</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><b>Valor da Nota Fiscal:</b> R$ ${quote.valor_nf?.toFixed(2)}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><b>Peso Físico:</b> ${quote.peso_fisico?.toFixed(2)} kg</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><b>Qtd. Volumes:</b> ${quote.quantidade}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><b>Tipo de Carga:</b> ${quote.tipo_carga || 'Geral'}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><b>Dimensões (LxAxP):</b> ${quote.largura}x${quote.altura}x${quote.profundidade} cm</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><b>Peso Tarifável:</b> ${breakdown?.cobravel?.toFixed(2) || quote.peso_tarifavel?.toFixed(2)} kg</td>
        </tr>
      </table>

      <h3 style="color: #800020; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; font-size: 16px;">Composição de Preços</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px dashed #eee;">Frete Base (Taxa de Despacho + Custo Transporte)</td>
          <td style="text-align: right; border-bottom: 1px dashed #eee;">R$ ${breakdown?.base?.toFixed(2) || '0.00'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px dashed #eee;">Gerenciamento de Risco (GRIS)</td>
          <td style="text-align: right; border-bottom: 1px dashed #eee;">R$ ${breakdown?.gris?.toFixed(2) || '0.00'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px dashed #eee;">Taxa de Seguro (Ad Valorem)</td>
          <td style="text-align: right; border-bottom: 1px dashed #eee;">R$ ${breakdown?.adValorem?.toFixed(2) || '0.00'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px dashed #eee;">Impostos (ICMS)</td>
          <td style="text-align: right; border-bottom: 1px dashed #eee;">R$ ${breakdown?.icms?.toFixed(2) || '0.00'}</td>
        </tr>
        ${
          breakdown?.appliedMin
            ? `
        <tr>
          <td style="padding: 8px 0; color: #d97706; font-style: italic;">* Aplicado Frete Mínimo do Cluster</td>
          <td style="text-align: right; color: #d97706;"></td>
        </tr>`
            : ''
        }
        
        <tr style="background-color: #f4f4f5;">
          <td style="padding: 12px 8px; font-weight: bold;">Subtotal da Cotação</td>
          <td style="text-align: right; padding: 12px 8px; font-weight: bold;">R$ ${(breakdown?.original || quote.valor_original)?.toFixed(2)}</td>
        </tr>

        ${
          quote.desconto_percentual > 0
            ? `
        <tr>
          <td style="padding: 8px 0; color: #ef4444;">Desconto Aplicado (${quote.desconto_percentual}%)</td>
          <td style="text-align: right; color: #ef4444;">- R$ ${(((breakdown?.original || quote.valor_original) * quote.desconto_percentual) / 100).toFixed(2)}</td>
        </tr>`
            : ''
        }
        
        ${
          quote.valor_override > 0
            ? `
        <tr>
          <td style="padding: 8px 0; color: #800020;">Ajuste de Negociação (Override)</td>
          <td style="text-align: right; color: #800020;">R$ ${quote.valor_override.toFixed(2)}</td>
        </tr>`
            : ''
        }
        
        <tr>
          <td style="padding: 20px 0 10px 0; font-size: 18px; font-weight: bold;">Valor Final do Frete</td>
          <td style="text-align: right; padding: 20px 0 10px 0; font-size: 20px; font-weight: bold; color: #800020;">R$ ${quote.valor_final?.toFixed(2)}</td>
        </tr>
      </table>

      <div style="margin-top: 80px; text-align: center;">
        <div style="border-top: 1px solid #999; width: 350px; margin: 0 auto; padding-top: 10px;">
          <p style="margin: 0; font-weight: bold; font-size: 16px; font-family: 'Courier New', Courier, monospace;">Assinado Digitalmente por ${user?.name || 'Sistema'}</p>
          <p style="margin: 5px 0 0 0; font-size: 11px; color: #666;">Documento gerado em ${new Date().toLocaleString()}</p>
          <p style="margin: 5px 0 0 0; font-size: 10px; color: #999;">Transzecão Logística LTDA • Validade de 15 dias</p>
        </div>
      </div>
    </div>
  `
  const win = window.open('', '', 'width=850,height=900')
  if (win) {
    win.document.write(
      `<html><head><title>Cotação ${quote.codigo || quote.id}</title></head><body onload="setTimeout(() => { window.print(); window.close(); }, 250);">${content}</body></html>`,
    )
    win.document.close()
  }
}
