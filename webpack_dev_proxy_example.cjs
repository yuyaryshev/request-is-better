module.exports.webpack_dev_proxy = {
	'/api': {
		target: 'http://localhost:3000',
		secure: false
	}
}
