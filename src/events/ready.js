module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		client.lavalink.init(client.user.id);
		console.log(`[BOT] Logged in as ${client.user.tag} and ready for listening to commands!`);
	},
};