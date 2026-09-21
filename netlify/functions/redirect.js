// netlify/functions/redirect.js
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
    const htmlHeaders = { 'Content-Type': 'text/html; charset=utf-8' };

    try {
        // نقرأ الكود من query parameter أولاً (الأكثر موثوقية)
        let shortCode = event.queryStringParameters && event.queryStringParameters.code;

        // احتياطي: من المسار مباشرة
        if (!shortCode) {
            const parts = event.path.split('/').filter(Boolean);
            shortCode = parts[parts.length - 1];
        }

        if (!shortCode || shortCode === 'redirect') {
            return {
                statusCode: 404,
                headers: htmlHeaders,
                body: '<h2>الرابط غير موجود</h2>'
            };
        }

        const store = getStore('short-links');
        const originalUrl = await store.get(shortCode);

        if (!originalUrl) {
            return {
                statusCode: 404,
                headers: htmlHeaders,
                body: '<h2>الرابط المختصر غير موجود</h2><p>تأكد من صحة الرابط.</p>'
            };
        }

        return {
            statusCode: 302,
            headers: { Location: originalUrl }
        };
    } catch (error) {
        console.error('Redirect error:', error);
        return {
            statusCode: 500,
            headers: htmlHeaders,
            body: '<h2>خطأ في السيرفر</h2><p>' + error.message + '</p>'
        };
    }
};