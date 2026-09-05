# Teachable Machine Model

هذا المجلد مخصص لملفات النموذج إذا قررتم تنزيل Export بصيغة TensorFlow.js ووضعه محليًا.

النسخة الحالية من Green Steps تستخدم رابط Teachable Machine مباشرة، وهو الأسهل للعرض:
https://teachablemachine.withgoogle.com/models/XXXX/

إذا أصبح لديكم model.json وmetadata.json وملفات weights، يمكن تعديل `js/app.js` ليقرأها من هذا المجلد بدل الرابط.

## Classes المدعومة في التطبيق
1. Plastic
2. Paper
3. Cardboard
4. Glass
5. Metal
6. Battery
7. E-Waste
8. Clothes
9. Organic

نصيحة: اجعلوا صور التدريب متنوعة في الإضاءة والخلفية والزوايا، ولا تعتمدوا على صور متشابهة جدًا.
