// netlify/functions/shorten.js
const { getStore } = require('@netlify/blobs');

const CHARS = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateCode(len) {
    let code = '';
    for (let i = 0; i < len; i++) {
        code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return code;
}

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        let url = (body.url || '').trim();

        if (!url) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'الرجاء إدخال رابط' })
            };
        }

        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

        try { new URL(url); }
        catch (e) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'الرابط غير صالح' })
            };
        }

        const store = getStore('short-links');

        let shortCode, exists, attempts = 0;
        do {
            shortCode = generateCode(6);
            exists = await store.get(shortCode);
            attempts++;
        } while (exists && attempts < 10);

        await store.set(shortCode, url);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ shortCode, url })
        };
    } catch (error) {
        console.error('Shorten error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'خطأ في السيرفر: ' + error.message })
        };
    }
};