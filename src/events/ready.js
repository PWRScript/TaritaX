module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`[BOT] Logged in as ${client.user.tag} and ready for listening to commands!`);
	},
};