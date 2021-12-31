// Imports
const fs = require('fs');
const { Client, Collection, MessageEmbed } = require('discord.js');
const dotenv = require('dotenv');
const { Manager } = require('erela.js');
const Spotify = require('better-erela.js-spotify').default;
const AppleMusic = require('erela.js-apple');
const Deezer = require('erela.js-deezer');
const Facebook = require('erela.js-facebook');
const humanizeDuration = require('humanize-duration');

// Load Environment Variables
dotenv.config();

// Hardcoded lavalink list (should be refactored)
const nodes = [
	// EU Node
	{
		host: 'lavalink.eu',
		password: 'Raccoon',
		port: 2333,
		secure: false,
		identifier: 'voice-eu-1',
	},

	// US Node
	// {
	//	host: 'lava.link',
	//	port: 80,
	//	secure: false,
	//	identifier: 'voice-us-1',
	// },
];

// Detect directory disposition
let base_directory = './src/';
if (!fs.existsSync('./src')) {
	base_directory = './';
}

// Declare client and distube
const client = new Client({ intents: process.env.DISCORD_INTENTS, presence: { activities:[{ name: '/help | Merry Christmas and Happy New Year!' }] } });
client.slashCommands = new Collection();
client.userCommands = new Collection();
client.messageCommands = new Collection();
client.lavalink = new Manager({
	nodes,
	autoPlay: true,
	plugins: [
		new Deezer(),
		new Facebook(),
		new AppleMusic(),
		new Spotify(),
	],
	send: (id, payload) => {
		const guild = client.guilds.cache.get(id);
		if (guild) guild.shard.send(payload);
	},
});

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

// Lavalink events
client.lavalink.on('nodeConnect', node => {
	console.log(`[LAVALINK-${node.options.identifier}] Connected to server successfuly`);
});

// Emitted whenever a node encountered an error
client.lavalink.on('nodeError', (node, error) => {
	console.log(`[LAVALINK-${node.options.identifier}] Error: ${error.message}.`);
});

// Emitted when a track starts
client.lavalink.on('trackStart', (player, track) => {

	const channel = client.channels.cache.get(player.textChannel);
	let p_embed = null;
	if (!track.isStream) {
		p_embed = new MessageEmbed().setColor('#991550').setTimestamp(Date.now()).setDescription(
			'**Title: **``' + track.title + '``\n**Uploaded by: **``' + track.author + '``\n**Duration: **``' + humanizeDuration(track.duration) + '``\n**Node: **``' + player.node.options.identifier + '``',
		).setTitle('🔊 Now Playing').setFooter('Requested by ' + track.requester.tag, track.requester.displayAvatarURL(),
		).setURL(track.uri).setImage(track.thumbnail);
	}
	else {

		p_embed = new MessageEmbed().setColor('#991550').setTimestamp(Date.now()).setDescription(
			'**Title: **``' + track.title + '``\n**Uploaded by: **``' + track.author + '``\n**Duration: **``Livestream``\n**Node: **``' + player.node.options.identifier + '``',
		).setTitle(':loudspeaker: Now Streaming').setFooter('Requested by ' + track.requester.tag, track.requester.displayAvatarURL(),
		).setURL(track.uri).setImage(track.thumbnail);
	}

	// Send a message when the track starts playing with the track name and the requester's Discord tag, e.g. username#discriminator
	channel.send({ embeds:[p_embed] });
});

// Emitted when a track can't be played
client.lavalink.on('trackError', (player, track, payload) => {
	const channel = client.channels.cache.get(player.textChannel);
	const err_embed = new MessageEmbed().setColor('#991550').setTimestamp(Date.now()).setDescription(
		'**Something went wrong when we tried to play the music:**\n```' + payload['error'] + '```',
	).setTitle('❌ Music Playback Failed').setFooter('Executed by ' + track.requester.tag, track.requester.displayAvatarURL(),
	);
	channel.send({ embeds:[err_embed] });
});

// Emitted the player queue ends
client.lavalink.on('queueEnd', player => {
	player.destroy();
});

// Here we send voice data to lavalink whenever the bot joins a voice channel to play audio in the channel.
client.on('raw', (d) => client.lavalink.updateVoiceState(d));

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

	if (command.guild_only && interaction.guild === null) {
		const j_gc_embed = new MessageEmbed().setColor('#991550').setTimestamp(Date.now()).setDescription(
			'**You must only use this command in a guild!**',
		).setTitle('❌ Guild Context Error').setFooter('Executed by ' + interaction.user.tag, interaction.user.displayAvatarURL(),
		);

		return interaction.reply(
			{ embeds:  [j_gc_embed] },
		);
	}

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
	}
});

// Login bot to discord
client.login(process.env.DISCORD_TOKEN);