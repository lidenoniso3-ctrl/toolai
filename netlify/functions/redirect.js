// netlify/functions/redirect.js
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
    try {
        // استخراج الكود القصير من مسار URL
        // مثال: /s/abc123 -> الكود هو abc123
        const pathParts = event.path.split('/');
        const shortCode = pathParts[pathParts.length - 1];

        if (!shortCode) {
            return { statusCode: 404, body: 'الرابط المختصر غير موجود' };
        }

        // الحصول على مخزن البيانات
        const store = getStore('short-links');

        // البحث عن الرابط الأصلي باستخدام الكود
        const originalUrl = await store.get(shortCode);

        if (!originalUrl) {
            return { statusCode: 404, body: 'الرابط المختصر غير موجود أو منتهي الصلاحية' };
        }

        // إعادة التوجيه إلى الرابط الأصلي
        return {
            statusCode: 302, // 302 تعني إعادة توجيه مؤقت
            headers: {
                Location: originalUrl,
            },
        };

    } catch (error) {
        console.error('Error redirecting:', error);
        return {
            statusCode: 500,
            body: 'حدث خطأ أثناء إعادة التوجيه'
        };
    }
};