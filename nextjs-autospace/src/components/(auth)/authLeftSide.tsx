import Image from "next/image";
import carImg from "../../../public/valet-illustration.png";

export default function AuthLeftSide() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <Image src={carImg} alt="Park Your Car" className="w-80 mb-6" />

      <h2 className="text-2xl font-bold mb-2">Park Your Car</h2>
      <p className="text-gray-600 max-w-xs">
        Track your vehicle in real-time with our valet service, enjoy
        hassle-free parking.
      </p>
    </div>
  );
}
