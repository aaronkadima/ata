# ATA · Registrador de Reunião

Aplicativo web estático, responsivo e em português, com pauta, gravação, transcrição, registros classificados, atas, relatórios e assinaturas.

## Ambientes web

| Ambiente | Branch de origem | Endereço no GitHub Pages | Uso |
| --- | --- | --- | --- |
| Produção | `main` | https://aaronkadima.github.io/ata/ | Versão estável |
| Desenvolvimento | `develop` | https://aaronkadima.github.io/ata/dev/ | Validação de novos recursos |

As páginas são publicadas pelo mesmo workflow no GitHub Actions, iniciado na `main`. Cada push em `develop` executa `Validar ATA desenvolvimento`; após validação, o workflow da `main` prepara e publica ambos os caminhos. Um push em `main` também publica as duas versões.

**Ativação inicial:** em **Settings → Pages → Build and deployment → Source**, selecione **GitHub Actions**. A publicação depende de permissões de Pages e de uma execução bem-sucedida em **Actions**.

A versão de desenvolvimento usa chaves de `localStorage` com sufixo `-dev`, separadas das utilizadas em produção. A navegação do aplicativo permanece independente nos dois endereços.

## Gravação e edição de áudio

Na tela **Reunião**, marque **Guardar áudio** antes de gravar. Depois de encerrar a captura, abra **Ouvir e editar gravação**.

- **Ouvir original** reproduz integralmente o áudio capturado.
- **Manter só trechos registrados** preserva intervalos próximos aos registros da linha do tempo. O usuário define o número de segundos **antes** e **depois** de cada registro, confirma os intervalos e ouve a seleção.
- **Excluir intervalo** e **Manter intervalo** permitem refinar os cortes, usando posições em segundos ou os botões de marcação da posição atual.
- **Ouvir versão editada** reproduz apenas as partes preservadas.
- **Exportar editado (.wav)** gera localmente uma cópia PCM/WAV sem modificar o arquivo original.
- O botão antigo **Baixar áudio** ainda exporta a captura original sem cortes.

**Atenção:** “trechos não registrados” significa intervalos do áudio fora das janelas de tempo associadas aos registros da ata; **não** há classificação semântica automática capaz de identificar toda fala importante. A marcação temporal de registros deve ser revisada. A seleção é inicialmente não destrutiva; nada é apagado do áudio original.

O áudio gravado por `MediaRecorder` permanece em memória até o encerramento/recarregamento da página; faça o download para preservar. Os registros textuais ficam no `localStorage`, mas o áudio não é sincronizado nem guardado em servidor. O processamento do WAV usa `AudioContext.decodeAudioData` e depende dos codecs e da memória do navegador. Arquivos muito grandes podem ser recusados para evitar exaustão de memória.

## Linha do tempo interativa e reprodução posterior

Depois de gravar com **Guardar áudio** habilitado, a forma de onda deixa de ser apenas o monitor visual do microfone e passa a funcionar como linha do tempo do **áudio original**:

- **Clique ou toque** na forma de onda para procurar a posição desejada; **arraste** para percorrer o áudio.
- **Cursor** acompanha o tempo durante a reprodução; o horário sob o ponteiro aparece como dica.
- Controle **Reproduzir / Pausar**, cronômetro e velocidades de **0,75× a 2×**.
- Na forma de onda focada, **← / →** movimentam cinco segundos, **Home / End** vão ao início/fim e **Espaço** reproduz/pausa.
- O horário de cada **trecho transcrito** também permite navegar para o instante correspondente, quando a gravação estiver carregada.
- As cores são atribuídas usando as identificações de falantes disponíveis na transcrição; sem identificação, usa-se o azul padrão. **Não há nova diarização inventada pelo player.**
- Durante a gravação, a onda original continua mostrando a amplitude e as cores do microfone em tempo real.

O aplicativo tenta guardar automaticamente o áudio da reunião em **IndexedDB**, armazenamento local do navegador, separadamente nos ambientes `/dev/` e `/`. Na mesma reunião, use **Reabrir gravação salva** para ouvir depois de atualizar ou reabrir a página; use **Excluir cópia local** para apagar do navegador. Essa retenção é limitada pelo armazenamento do aparelho e pode ser apagada pelo navegador ou pelo usuário. **Baixe o áudio original para backup durável.** Não há sincronização entre aparelhos, conta ou servidor.

A forma de onda da gravação corresponde ao áudio original; na prévia de edição, ela é ocultada para não representar indevidamente os horários do áudio concatenado.

## Interface

- Navegação desktop lateral e mobile inferior: **Reunião**, **Agenda**, **Atas** e **Ajustes**.
- Controles secundários fora do foco principal; transcrição e gravação agrupadas.
- Ícones vetoriais em `assets/icons.svg`, desenhados no estilo de traço discreto da referência no Canva. O arquivo Canva consultado não disponibilizou ícones editáveis para exportação, portanto não são arquivos originais do Canva.
- Estilos do estúdio e ícones em `assets/studio.css`.

## Desenvolvimento

Edite e teste a branch `develop`; revise o resultado em `/dev/` antes de abrir PR para `main`. Ao aprovar e mesclar o PR, as mudanças passam a produção.

```sh
node --check assets/audio-editor.js
node tests/check.js
```

Não coloque chaves de API, gravações confidenciais ou dados pessoais em arquivos versionados. Em reuniões com pessoas identificadas, obtenha as autorizações necessárias para gravação e tratamento de dados. Os recursos de transcrição/IA podem exigir permissões, serviços ou modelos externos.

## Principais arquivos

```
index.html                  # Aplicativo de reuniões
assets/audio-editor.js      # Player, armazenamento local e editor não destrutivo
assets/waveform-player.js    # Forma de onda navegável sincronizada
assets/icons.svg            # Ícones vetoriais
assets/studio.css           # Estilos responsivos do editor
manifest.webmanifest        # Metadados do app instalável
tests/check.js              # Validação estática das integrações
.github/workflows/validate.yml # Lint na develop
.github/workflows/pages.yml    # Deploy main → / e develop → /dev/
```

[Referência Figma](https://www.figma.com/design/dWmJGlLAVfmuC5DymOsB6n) · [Conceito Canva](https://canva.link/010uevpvtumxqzy).
