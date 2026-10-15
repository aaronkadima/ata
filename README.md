# Registrador de Reunião · Ata

Aplicativo web responsivo, com interface para desktop e dispositivos móveis, para registrar reuniões, organizar pautas e elaborar atas e relatórios.

## Executar

Abra o arquivo `index.html` em um navegador moderno ou publique o conteúdo da raiz do repositório por GitHub Pages. Para acesso ao microfone e outras APIs do navegador, use **HTTPS** (o GitHub Pages já fornece HTTPS).

## Funcionalidades incluídas

- Identificação da reunião: título, data, local, coordenação, relator, participantes e pauta
- Cronômetro e estados de início e encerramento
- Gravação de áudio e transcrição, de acordo com os recursos e permissões do navegador
- Reconhecimento/identificação de falantes, com opções de revisão
- Registros classificados como nota, decisão, ação, questão e risco
- Linha do tempo e classificação automática
- Importação de convites de calendário (.ics)
- Geração, edição e exportação de atas, relatórios e documentos
- Modelos e configurações de formatação
- Fluxos de revisão, aprovação e assinaturas
- Assistente virtual opcional, com configuração própria
- Interface adaptativa para desktop e celular

A implementação preserva o JavaScript e os IDs da aplicação anterior, acrescentando a navegação reduzida e o layout minimalista.

## Instalação como aplicativo no celular

Quando publicado em HTTPS, abra o site no Chrome ou Safari e use a opção **Adicionar à tela inicial** ou **Instalar aplicativo**, conforme o navegador. O manifesto identifica o aplicativo, mas não há `service worker` de cache offline; portanto, não é prometido funcionamento integral sem internet.

## Publicação no GitHub Pages

A workflow `.github/workflows/pages.yml` publica os arquivos estáticos da raiz a partir da branch `main`. Em **Settings → Pages**, escolha **GitHub Actions** como fonte da publicação, caso o Pages ainda não esteja ativado.

Endereço esperado após a ativação e o sucesso da publicação: https://aaronkadima.github.io/ata/

## Privacidade e limitações

- Os registros e configurações são mantidos localmente no navegador por meio de `localStorage`; **não há autenticação, sincronização entre dispositivos ou backup em servidor**.
- O áudio, os modelos de transcrição e a geração de relatórios dependem das permissões, memória, compatibilidade do navegador e/ou serviços externos configurados.
- Serviços externos opcionais, incluindo um provedor de IA para o assistente virtual, podem transmitir conteúdo da reunião ao fornecedor. Leia os avisos do aplicativo e as políticas de cada serviço.
- **Não insira chaves privadas compartilhadas ou credenciais de produção no código-fonte.** Uma chave usada diretamente no navegador pode ser exposta ao usuário do próprio navegador; para uso institucional, mova chamadas autenticadas para um backend seguro.
- Para ata formal, assinatura, validade jurídica e conformidade com LGPD, revise os documentos e os procedimentos de consentimento, armazenamento e assinatura aplicáveis.

## Estrutura

```
index.html                  # aplicação web responsiva
manifest.webmanifest        # metadados de instalação
assets/icon.svg             # ícone do aplicativo
.github/workflows/pages.yml # implantação estática
.nojekyll                   # publicação de assets sem processamento Jekyll
```

Designs relacionados: [Figma](https://www.figma.com/design/dWmJGlLAVfmuC5DymOsB6n) · [Canva](https://canva.link/010uevpvtumxqzy).
