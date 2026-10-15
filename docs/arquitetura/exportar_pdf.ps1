# Atualiza o sumário e os campos do .docx no Microsoft Word e exporta para PDF.
# Uso: powershell -File exportar_pdf.ps1 <entrada.docx> <saida.pdf>
param([string]$Docx, [string]$Pdf)

$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $doc = $word.Documents.Open((Resolve-Path $Docx).Path)
    $doc.Fields.Update() | Out-Null
    foreach ($toc in $doc.TablesOfContents) { $toc.Update() }
    $doc.Save()
    # 17 = PDF; 0 = otimizado para impressão; 1 = marcadores a partir dos títulos
    $doc.ExportAsFixedFormat($Pdf, 17, $false, 0, 0, 1, 1, 0, $true, $true, 1)
    $doc.Close(0)
}
finally {
    # Algumas instalações do Office derrubam a conexão COM no Quit; o PDF já foi gravado.
    try { $word.Quit() } catch { }
}
