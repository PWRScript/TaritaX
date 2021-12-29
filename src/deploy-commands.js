const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dotenv = require('dotenv');

dotenv.config();

let base_directory = './src/';
if (!fs.existsSync('./src')) {
	base_directory = './';
}

const commands = [];

const slashCommandFiles = fs.readdirSync(base_directory + 'commands/slash').filter(file => file.endsWith('.js'));
const messageCommandFiles = fs.readdirSync(base_directory + 'commands/message').filter(file => file.endsWith('.js'));
const userCommandFiles = fs.readdirSync(base_directory + 'commands/user').filter(file => file.endsWith('.js'));

for (const file of slashCommandFiles) {
	const command = require(`./commands/slash/${file}`);
	commands.push(command.data.toJSON());
}
for (const file of messageCommandFiles) {
	const command = require(`./commands/message/${file}`);
	commands.push(command.data.toJSON());
}
for (const file of userCommandFiles) {
	const command = require(`./commands/user/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID), { body: [] })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);

rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);