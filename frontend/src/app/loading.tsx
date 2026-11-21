import React from 'react';
import LoadingSplashScreen from '../components/Branding/LoadingSplashScreen';

export default function Loading() {
  return (
    <LoadingSplashScreen
      message="Iniciando cartografía y enrutamiento satelital de Barranca..."
      subMessage="Red Provincial · UNAB — Supe — Pativilca — Paramonga"
      fullScreen={true}
    />
  );
}
