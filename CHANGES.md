ALTERACOES (em relacao ao clima-madeira)

-create new db and run the scripts

-config
  -adicionar routes no config/default.js
  -copiar os ficheiro dev e dev-no-auth

-client
  -copiar directorias para as aplicacões client:
    -map
    -dashboard

  -adicionar logos
  -adicionar bibliotecas (?)

-server
  -nas views, 
    substituir views/layouts/default.html
    substituir views/macros/navigation.html
    substituir views/home.html
    subtituir client/common/css/main.css
    substituir view/common/footer.html
    substituir views/mapa.html

  - no config/default.js, adicionar o route "mapa"

  - no routes/assets-routes.js, adicionar o '/mapa/{anyPath*}'

  - no gruntfile, adicionar a compilação dos templates em client/mapa (semelhante à do dashboard)


-antes de iniciar o servidor, definir a NODE_ENV
