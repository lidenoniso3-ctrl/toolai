// netlify/functions/shorten.js
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
    // التأكد من أن الطلب هو POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { url } = JSON.parse(event.body);

        // التحقق من صحة الرابط
        if (!url || !/^https?:\/\//i.test(url)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'الرجاء إدخال رابط صالح يبدأ بـ http:// أو https://' })
            };
        }

        // إنشاء كود قصير عشوائي (6 أحرف)
        const shortCode = Math.random().toString(36).substring(2, 8);

        // الحصول على مخزن البيانات (Blob Store)
        const store = getStore('short-links');

        // حفظ الرابط في المخزن باستخدام الكود كمفتاح
        await store.set(shortCode, url);

        // إعادة الكود القصير
        return {
            statusCode: 200,
            body: JSON.stringify({ shortCode })
        };

    } catch (error) {
        console.error('Error shortening link:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'حدث خطأ أثناء اختصار الرابط' })
        };
    }
};