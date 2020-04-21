<br />
<p align="center">
    <a href="https://www.coddei.com">
        <img src="https://i.imgur.com/03bCh2l.png" width=80%>
    </a>
</p>
<br />

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
    "guildID": "ID do servidor no Discord",
    "accentColor": "#0072FF", // Cor usada em embeds
    "roles": {
        "defaultRoleID": "ID da role padrão para novos usuários",
        "memberRoleID": "ID da role para usuário cadastrados"
    },
    "channels": {
        "materialsChannelID": "ID do canal para materiais do comando !indicar",
        "newcomersChannelID": "ID do canal de novos membros do comando !registrar"
    },
    "language": "pt_br"
}
```
Por enquanto apenas `pt_br` está disponível.

## Para rodar
```bash
node src/index.js
```
