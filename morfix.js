/*
* Credit: some of this code came originally from -
* https://github.com/outofink/morfix-lite
* Big thanks!
* */

const request = require('request');

module.exports = function () {

    function translateWord(inputWord) {
        return new Promise((resolve, reject) => {
            let sanitizedWord = inputWord.replace(/[`~!@#$%^&*()_|+\=?;:'",.<>\{\}\[\]\\\/]/gi, '');
            let bodyjson = `{"Query":"${sanitizedWord}","ClientName":"Android_Hebrew"}`;
            let resp = 0;

            const lengthInUtf8Bytes = (str) => {
                var m = encodeURIComponent(str).match(/%[89ABab]/g);
                return str.length + (m ? m.length : 0);
            };

            let contentLength = lengthInUtf8Bytes(bodyjson);

            request({
                    method: 'POST',
                    uri: "http://services.morfix.com/translationhebrew/TranslationService/GetTranslation/",
                    headers: {
                        "Accept": "application/json",
                        "Content-type": "application/json",
                        "Content-Length": contentLength,
                        "Host": "services.morfix.com",
                        "Connection": "Keep-Alive"
                    },
                    body: bodyjson
                },
                (error, response, body) => {
                    output = JSON.parse(body);
                    json = [];
                    for (i = 0; i < output.Words.length; i++) {
                        translation = [];
                        buffer = [];
                        output.Words[i].OutputLanguageMeanings.forEach(function (definitions) {
                            definitions.forEach(function (definition) {
                                buffer.push(definition.DisplayText)
                            });
                            translation.push(buffer.join(", "));
                            buffer = []
                        });
                        json[i] = {
                            "word": output.Words[i].InputLanguageMeanings[0][0].DisplayText,
                            "diber": output.Words[i].PartOfSpeech,
                            "translation": translation
                        }
                    }

                    resolve({
                        title: inputWord,
                        data: json
                    });
                });
        });
    }

    return {
        translateWord
    };
}();