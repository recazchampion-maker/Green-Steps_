# Teachable Machine Model

هذا المجلد مخصص لملفات النموذج إذا قررتم تنزيل Export بصيغة TensorFlow.js ووضعه محليًا.

النسخة الحالية من Green Steps تستخدم رابط Teachable Machine مباشرة، وهو الأسهل للعرض:
https://teachablemachine.withgoogle.com/models/XXXX/

إذا أصبح لديكم model.json وmetadata.json وملفات weights، يمكن تعديل `js/app.js` ليقرأها من هذا المجلد بدل الرابط.

## Classes المقترحة
1. Plastic
2. Paper
3. Glass
4. Metal
5. Battery
6. E-Waste
7. Clothes
8. Organic

نصيحة: اجعلوا صور التدريب متنوعة في الإضاءة والخلفية والزوايا، ولا تعتمدوا على صور متشابهة جدًا.
