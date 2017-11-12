/*
 * email.
 */

const emailjs = require("emailjs/email");


exports.createServer =  function (password) {
  var mail = {
    user: "minjieliu@163.com",
    password: password,
    host: "smtp.163.com",
    ssl: false,
    from: "minjieliu@163.com"
  };
  var instance;

  function createServer(opt) {
    var _opt, _server, _send;

    if (!opt) {
      instance = instance || createServer({});
      return instance;
    }

    _opt = {
      user: opt.user || mail.user,
      password: opt.password || mail.password,
      host: opt.host || mail.host,
      ssl: opt.ssl === true ? true : mail.ssl
    };
    _server = emailjs.server.connect(_opt);
    _server['_send'] = _server.send;
    _server.send = function(opt) {
      var _headers, _message;
      _headers = {
        text: opt.text || "",
        from: opt.from || mail.from,
        to: opt.to || '',
        cc: opt.cc || "",
        subject: opt.subject || ""
      }
      _message = emailjs.message.create(_headers);
      _message.attach_alternative(opt.html || '');

      _server._send(_message, function(err, message) {
        if (typeof opt.cb == 'function') {
          opt.cb.call(null, err, message);
        }
      });
    };
    return _server;
  };

  return createServer(mail);
}
