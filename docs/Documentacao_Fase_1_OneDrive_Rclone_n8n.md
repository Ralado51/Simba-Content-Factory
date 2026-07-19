# Simba Content Factory — Fase 1

**Status:** concluída e validada em 19 de julho de 2026  
**Objetivo:** conectar o OneDrive ao ambiente Docker/n8n e provar o processamento de vídeos grandes sem carregar o arquivo inteiro na memória do n8n.

## Resultado da fase

Foi montado e testado o seguinte caminho:

```text
OneDrive Family
  → rclone (Docker)
  → volume Docker compartilhado (/data)
  → n8n + FFmpeg
  → corte vertical
  → OneDrive / 03-Cortes-para-revisar
```

O fluxo já funciona para vídeos grandes. O n8n controla as operações, enquanto o rclone transfere os arquivos diretamente entre o OneDrive e a VPS. Dessa forma, os vídeos não viram *binary data* dentro do n8n.

## Decisões tomadas

### OneDrive Family como armazenamento principal

O plano Microsoft 365 Family foi mantido como repositório de vídeos. Não foi necessário migrar para Microsoft 365 Developer, Microsoft Entra ou Azure apenas para esta etapa.

### rclone em vez de OAuth nativo do OneDrive no n8n

O OAuth nativo exigia registro de aplicativo no Microsoft Entra. Como a conta era pessoal e não possuía um diretório Entra/Azure pronto, foi adotado o rclone.

Benefícios:

- autenticação com a conta OneDrive pessoal;
- transferência de arquivos grandes fora da memória do n8n;
- possibilidade de retomar transferências;
- comunicação interna entre containers;
- operação sem expor a API do rclone para a internet.

### FFmpeg mantido; Whisper opcional

Os vídeos do Simba têm pouca ou nenhuma fala. Portanto:

- **FFmpeg é obrigatório** para cortes, conversão, renderização, áudio, música, texto e exportação;
- **Whisper não é obrigatório** e deverá ser chamado apenas se houver voz humana relevante;
- a seleção futura dos melhores trechos dependerá principalmente de movimento, cenas, presença do Simba e eventos de áudio.

## Infraestrutura criada

### Container rclone

Foi criada uma stack Docker chamada `rclone` com:

- imagem `rclone/rclone:latest`;
- serviço `rclone rcd` na rede Docker `n8n`;
- autenticação Basic Auth para a API RC;
- sem publicação de porta externa;
- volume de configuração persistente;
- volume de mídia compartilhado.

Estrutura lógica da stack:

```yaml
services:
  rclone:
    image: rclone/rclone:latest
    container_name: rclone
    restart: unless-stopped
    command:
      - rcd
      - --rc-addr=:5572
      - --rc-user=n8n
      - --rc-pass=<SENHA_FORTE>
    volumes:
      - rclone_config:/config/rclone
      - simba_media:/data
    networks:
      - n8n_network

volumes:
  rclone_config:
  simba_media:

networks:
  n8n_network:
    external: true
    name: n8n
```

> A senha real não deve ser registrada neste documento nem em workflows.

### Configuração do remoto OneDrive

Foi configurado um remoto chamado `onedrive` usando a conta Microsoft 365 Family.

Validação executada:

```sh
rclone lsd onedrive: --config=/config/rclone/rclone.conf
```

Resultado: as pastas do OneDrive foram listadas, confirmando leitura e autenticação.

### Estrutura de pastas no OneDrive

Foi criada a pasta raiz `Simba Videos` e a seguinte estrutura:

```text
Simba Videos/
├── 01-Brutos
├── 02-Processando
├── 03-Cortes-para-revisar
├── 04-Aprovados
├── 05-Publicados
├── 06-Metricas
└── 99-Erros
```

## Alteração na stack n8n

O container n8n usa a imagem customizada `n8n-ffmpeg:2.30.7`, que contém FFmpeg.

Foi adicionado o volume compartilhado criado pela stack rclone:

```yaml
services:
  n8n:
    volumes:
      - ${DATA_FOLDER}/.n8n:/root/.n8n
      - /root/n8n-local-files:/files
      - rclone_simba_media:/data

volumes:
  n8n_postgres_data:
  rclone_simba_media:
    external: true
```

Assim, tanto o rclone quanto o n8n acessam a mesma área temporária:

```text
/data/brutos
/data/cortes
/data/processando
/data/temporarios
```

As permissões do volume foram ajustadas no container rclone:

```sh
mkdir -p /data/brutos /data/cortes /data/processando /data/temporarios
chown -R 1000:1000 /data
chmod -R u+rwX,g+rwX /data
```

## Workflow de teste criado

Arquivo gerado para importação no n8n:

```text
workflow-teste-onedrive-rclone.json
```

Fluxo do workflow:

1. **Manual Trigger** — inicia o teste.
2. **HTTP Request: `operations/list`** — lista os vídeos em `onedrive:Simba Videos/01-Brutos`.
3. **Split Out** — transforma cada vídeo listado em um item do n8n.
4. **Limit** — seleciona um vídeo para teste.
5. **HTTP Request: `operations/copyfile`** — pede ao rclone para copiar o vídeo para `/data/brutos` de forma assíncrona.
6. **Wait** — aguarda 15 segundos.
7. **HTTP Request: `job/status`** — consulta se o download terminou.
8. **Set** — apresenta o status final do teste.

Os três nodes HTTP usam uma credencial n8n do tipo **Basic Auth**:

```text
Usuário: n8n
Senha: a mesma definida em --rc-pass na stack do rclone
```

Essa credencial deve ser selecionada em:

- `Listar vídeos no OneDrive`;
- `Copiar vídeo para a VPS`;
- `Consultar download`.

## API rclone utilizada

Endereço interno da API:

```text
http://rclone:5572
```

Endpoints testados:

| Endpoint | Uso |
| --- | --- |
| `POST /config/listremotes` | verifica comunicação entre n8n e rclone |
| `POST /operations/list` | lista os vídeos da pasta de entrada |
| `POST /operations/copyfile` | copia um vídeo do OneDrive para a VPS |
| `POST /job/status` | consulta a execução assíncrona da cópia |

Exemplo de listagem:

```json
{
  "fs": "onedrive:Simba Videos/01-Brutos",
  "remote": "",
  "opt": {
    "recurse": false,
    "filesOnly": true
  }
}
```

Exemplo de cópia assíncrona:

```json
{
  "srcFs": "onedrive:Simba Videos/01-Brutos",
  "srcRemote": "NOME_DO_VIDEO.mp4",
  "dstFs": "/data/brutos",
  "dstRemote": "NOME_DO_VIDEO.mp4",
  "_async": true
}
```

## Testes executados e aprovados

### 1. Listagem de vídeos no OneDrive

O n8n listou os arquivos em `01-Brutos`, incluindo vídeos de diferentes tamanhos. Foram retornados nome, caminho, tamanho, tipo MIME, data e ID do OneDrive.

Exemplos observados:

| Vídeo | Tamanho aproximado |
| --- | ---: |
| `20260715_153336.mp4` | 217,7 MB |
| `20260715_153742.mp4` | 102,5 MB |
| `20260717_180715.mp4` | 11,6 MB |
| `20260718_124045.mp4` | 4,4 MB |

### 2. Cópia do OneDrive para a VPS

O workflow solicitou a cópia por `operations/copyfile` e retornou:

```json
{
  "finished": true,
  "success": true,
  "error": ""
}
```

Vídeos foram confirmados no volume compartilhado em `/data/brutos`.

### 3. Leitura do arquivo pelo n8n

O node **Execute Command** no n8n executou:

```sh
ls -lh /data/brutos
```

Resultado: os mesmos arquivos baixados pelo rclone estavam disponíveis para o n8n.

### 4. Inspeção de vídeo com FFprobe

Foi inspecionado um vídeo local de teste. Resultado observado:

```text
Arquivo: /data/brutos/2026-05-18-214749178.mp4
Duração: 55,750998 segundos
Tamanho: 27.293.721 bytes
Vídeo: HEVC, 1080x1920, 30 fps
Áudio: AAC, 44,1 kHz, estéreo
```

### 5. Primeiro corte vertical com FFmpeg

Foi gerado um corte técnico de 15 segundos:

```sh
ffmpeg -y \
  -ss 0 \
  -t 15 \
  -i "/data/brutos/2026-05-18-214749178.mp4" \
  -map 0:v:0 \
  -map 0:a? \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1" \
  -c:v libx264 \
  -preset veryfast \
  -crf 23 \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  "/data/cortes/teste-vertical.mp4"
```

Resultado:

```text
Arquivo: /data/cortes/teste-vertical.mp4
Duração: aproximadamente 15 segundos
Resolução: 1080x1920 (9:16)
Vídeo: H.264
Áudio: AAC
Tamanho: aproximadamente 8,6 MB
Tempo de renderização: aproximadamente 17 segundos
```

### 6. Envio do corte para revisão

O corte gerado foi enviado para o OneDrive:

```sh
rclone copy \
  "/data/cortes/teste-vertical.mp4" \
  "onedrive:Simba Videos/03-Cortes-para-revisar" \
  --config=/config/rclone/rclone.conf
```

Resultado: aprovado. O arquivo foi disponibilizado na pasta de revisão do OneDrive.

## Regras importantes para os próximos workflows

1. Não baixar vídeos usando nodes que criam `binary data` no n8n.
2. Usar rclone para toda movimentação entre OneDrive e VPS.
3. Usar caminhos locais em `/data/...` para FFmpeg, Whisper, OpenCV e YOLO.
4. Processar vídeos localmente e remover temporários após envio dos resultados.
5. Não expor a porta `5572` do rclone para a internet.
6. Não registrar tokens do OneDrive, senhas ou conteúdo de `rclone.conf` em workflows, documentos ou repositórios.
7. Manter o volume `rclone_rclone_config` acessível apenas ao container rclone.

## Próxima fase

Criar o workflow **Simba — Processar Vídeo** a partir do teste atual.

Responsabilidades:

```text
01-Brutos
  → copiar para /data/brutos
  → inspecionar metadados
  → detectar cenas, movimento e Simba
  → escolher momentos fortes
  → renderizar versões de 15, 30 e 60 segundos
  → enviar para 03-Cortes-para-revisar
  → mover original para 02-Processando
  → limpar arquivos temporários da VPS
```

Depois disso, criar os workflows de aprovação/publicação e métricas.
