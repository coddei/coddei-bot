<div style="text-align: center; padding: 50px">
    <a href="https://www.coddei.com">
        <img src="https://i.imgur.com/03bCh2l.png" width=80%>
    </a>
</div>

# Coddei Bot
Bot feito em Node.js que será utilizado para gerenciar o servidor da [Coddei](https://www.coddei.com) no Discord.

## Instalação
```bash
npm install
```

## Configuração
Renomear `config.sample.json` para `config.json`.

Configurar os valores no arquivo.
```json
{
    "prefix": "prefixo do bot aqui. Ex: !",
    "token": "auth token do bot no Discord",
    "defaultRole": "role padrão para novos usuários",
    "language": "pt_br"
}
```
Por enquanto apenas `pt_br` está disponível.

## Para rodar
```bash
node src/index.js
```