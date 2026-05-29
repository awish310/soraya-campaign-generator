import Image from 'next/image';
import icon from './icon.png';

export default function MaintenancePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <Image
            src={icon}
            alt="מרכז סוראיה"
            width={88}
            height={88}
            priority
            className="rounded-2xl shadow-sm"
          />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-forest-800">
            אנחנו כבר חוזרים
          </h1>
          <p className="text-forest-700/80 leading-relaxed">
            הכלי בתחזוקה מתוכננת. אנא חזרו אלינו בעוד מספר רגעים.
          </p>
        </div>

        <div className="flex justify-center items-center gap-1.5 pt-2">
          <span className="w-2 h-2 rounded-full bg-forest-600 dot-1" />
          <span className="w-2 h-2 rounded-full bg-forest-600 dot-2" />
          <span className="w-2 h-2 rounded-full bg-forest-600 dot-3" />
        </div>
      </div>
    </main>
  );
}
