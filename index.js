const request = require('request');
const fs = require('fs');
const jsdom = require("jsdom/lib/old-api");
const jquery = require('jquery');
const prompt = require('prompt');

const urls = [
	'https://y.qq.com/n/yqq/playlist/3259424259.html#stat=y_new.profile.create_playlist.click&dirid=2',
	'https://y.qq.com/n/yqq/playlist/3259424298.html#stat=y_new.profile.create_playlist.click&dirid=3',
	'https://y.qq.com/n/yqq/playlist/3259424315.html#stat=y_new.profile.create_playlist.click&dirid=4',
	'https://y.qq.com/n/yqq/playlist/3259424501.html#stat=y_new.profile.create_playlist.click&dirid=5',
	'https://y.qq.com/n/yqq/playlist/3259424510.html#stat=y_new.profile.create_playlist.click&dirid=6',
	'https://y.qq.com/n/yqq/playlist/3259424515.html#stat=y_new.profile.create_playlist.click&dirid=7',
	'https://y.qq.com/n/yqq/playlist/3260357902.html#stat=y_new.profile.create_playlist.click&dirid=8'
];


function handleDom (window, content, html, url, success) {
	const $ = jquery(window);
	$("body").html('');
	$("body").append(content);
	const header = $('.data__name_txt').text();
	console.log(`handle: ${header}`);

	const songs = [];
	const list = $('.songlist__list > li');
	
	list.each(function () {
		const title = $(this).find('.songlist__songname .songlist__songname_txt').text();
		const singer = $(this).find('.songlist__artist .singer_name').text();
		if (!title) {
			console.error('no title');
			return false;
		}		
		songs.push({
			title: title,
			singer: singer
		})	
	});

	if (songs.length === list.length && header) {
		fs.writeFile(`./list/${header}.txt`, JSON.stringify(songs, null, 1), 'utf8', function (err) {
			if (err) {
				console.error(err);
				return;
			}

			html += `<tr><td><div style="font-size: 20px; color: red;">${header}</div></td><td></td></tr>`;
			songs.forEach(function (item) {
				html += `<tr><td>${item.title}</td><td>${item.singer}</td></tr>`;
			});
			html += '<tr><td></td><td></td></tr>';
			success && success(html);
		})
	} else {
		console.error('songs !== list or no header', url);
	}
}


prompt.get(['password'], function (err, result) {
	if (err) {
		console.error(err);
		return
	}
	if (!result.password) {
		console.log('no password');
		return
	}

	const server = require('./email').createServer(result.password);

	jsdom.env("", function(err, window) {
		if (err) {
			console.error(err);
			return;
		}
		const helper = {
			urls: urls,
			index: 0,
			request: function (html) {
				if (this.index >= this.urls.length) {
					html += '</tbody></table>';

					const date = new Date();

					server.send({
					  to: 'minjieliu@163.com',
					  subject: `song_qq_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
					  html: html,
					  cb: function (err, message) {
					  	if (err) {
					  		console.log(message);
					  		console.error(err);
					  		return;
					  	}
					  }
					});
					return;
				}

				const url = this.urls[this.index++];

				request.get({
					url: url,
				}, function (err, req, content) {
					if (err) {
						console.error(err);
						return
					}
					
					handleDom(window, content, html, url, function (html) {
						helper.request(html);
					});
				});
			}
		}
		let html = '<table><tbody>';
		helper.request(html);
	});
})











