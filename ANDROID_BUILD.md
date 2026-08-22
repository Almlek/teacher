# تطبيق المعلم الذكي لأندرويد

تمت إضافة غلاف Capacitor إلى منصة المعلم الذكي مع مشروع Android أصلي داخل مجلد `android/`. التطبيق يحمل النسخة المنشورة من الموقع على `https://smartplan-ppvujobi.manus.space`، لذلك تستمر المصادقة والذكاء الاصطناعي وقاعدة البيانات والتخزين السحابي والتصدير بالعمل من خلال خادم الموقع نفسه.

## المتطلبات

يحتاج البناء المحلي إلى Node.js، وpnpm، وJDK 21 أو إصداراً متوافقاً مع نسخة Android Gradle Plugin، إضافة إلى Android Studio أو Android SDK يتضمن `platform-tools` و`build-tools` ونسخة Android حديثة. يجب ضبط `ANDROID_HOME` أو `ANDROID_SDK_ROOT` وإضافة أدوات SDK إلى `PATH`.

## المزامنة والبناء

من جذر المشروع:

```bash
pnpm install --frozen-lockfile
pnpm android:sync
```

لإنشاء نسخة اختبار قابلة للتثبيت:

```bash
cd android
./gradlew assembleDebug
```

سيظهر ملف APK في:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

لتشغيله على جهاز متصل مع تفعيل USB debugging:

```bash
cd android
./gradlew installDebug
```

أو استخدم Android Studio لفتح مجلد `android/` وتشغيل المشروع على محاكي أو جهاز حقيقي.

## نسخة النشر

لإنشاء APK أو AAB موقّع للنشر في Google Play، أنشئ مفتاح توقيع خاصاً، أضف بيانات التوقيع إلى إعدادات Gradle السرية في بيئة البناء، ثم نفّذ:

```bash
cd android
./gradlew bundleRelease
```

لا تضع ملف keystore أو كلمات المرور داخل المستودع أو ملف ZIP العام.

## ملاحظات مهمة

الغلاف الحالي يعتمد على اتصال HTTPS بالموقع المنشور، ولا يعمل كتطبيق مستقل دون اتصال. يجب أن يبقى النطاق المنشور متاحاً، كما يجب ضبط متغيرات البيئة وقاعدة البيانات على استضافة الموقع نفسها. صلاحية الإنترنت مضافة تلقائياً في `AndroidManifest.xml`، وتم تعطيل الاتصالات غير المشفرة. لا توجد مفاتيح Gemini أو قاعدة البيانات داخل تطبيق Android؛ تبقى هذه الأسرار على الخادم.

عند تغيير نطاق الموقع، حدّث قيمة `server.url` و`allowNavigation` في `capacitor.config.ts` ثم نفّذ `pnpm android:sync` مرة أخرى.
