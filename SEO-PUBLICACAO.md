# Publicação e SEO

1. O site está preparado para `https://cervantesperin.github.io/bymacatester/`.
2. Gere o sitemap usando o domínio definitivo:
   `SITE_URL=https://seudominio.com node tools/generate-sitemap.mjs`
3. Acrescente ao final de `robots.txt`:
   `Sitemap: https://seudominio.com/sitemap.xml`
4. Cadastre o domínio no Google Search Console e envie `sitemap.xml`.
5. Valide as páginas de produto no Rich Results Test e o endereço no Perfil da Empresa do Google.
6. Meça os dados reais de LCP, INP e CLS depois que o domínio receber visitas.

Não use URLs com parâmetros de atualização como canônicas. A camada `seo-runtime.js` remove parâmetros e hash da URL canônica em produção.
