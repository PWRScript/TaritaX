// Imports
const fs = require('fs');
const { Client, Collection } = require('discord.js');
const dotenv = require('dotenv');

// Load Environment Variables
dotenv.config();

// Detect directory disposition
let base_directory = './src/';
if (!fs.existsSync('./src')) {
	base_directory = './';
}

// Declare client and distube
const client = new Client({ intents: process.env.DISCORD_INTENTS });
client.slashCommands = new Collection();
client.userCommands = new Collection();
client.messageCommands = new Collection();

// Get events and commands
const eventFiles = fs.readdirSync(base_directory + 'events').filter(file => file.endsWith('.js'));
const slashCommandFiles = fs.readdirSync(base_directory + 'commands/slash').filter(file => file.endsWith('.js'));
const messageCommandFiles = fs.readdirSync(base_directory + 'commands/message').filter(file => file.endsWith('.js'));
const userCommandFiles = fs.readdirSync(base_directory + 'commands/user').filter(file => file.endsWith('.js'));

// Register events
for (const file of eventFiles) {
	const event = require(`./events/${file}`);

	if (event.name == 'interactionCreate') continue;

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Register commands
for (const file of slashCommandFiles) {
	const command = require(`./commands/slash/${file}`);
	client.slashCommands.set(command.data.name, command);
}
for (const file of messageCommandFiles) {
	const command = require(`./commands/message/${file}`);
	client.messageCommands.set(command.data.name, command);
}
for (const file of userCommandFiles) {
	const command = require(`./commands/user/${file}`);
	client.userCommands.set(command.data.name, command);
}

// Event to handle commands
client.on('interactionCreate', async interaction => {
	let command = null;

	if (interaction.isCommand()) {
		command = client.slashCommands.get(interaction.commandName);
	}
	else if (interaction.isUserContextMenu()) {
		command = client.userCommands.get(interaction.commandName);
	}
	else if (interaction.isMessageContextMenu()) {
		command = client.messageCommands.get(interaction.commandName);
	}
	else {
		return;
	}

	if (!command) return;

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
	}
});

// Login bot to discord
client.login(process.env.DISCORD_TOKEN);