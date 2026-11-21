'use client';

import React from 'react';

export type VehicleTypeCategory = 'SEDAN' | 'STATION_WAGON' | 'SUV' | 'MINIVAN' | 'COMBI' | 'MOTOTAXI';

export interface VehicleSeat {
  id: string;
  label: string;
  type: 'driver' | 'passenger';
  status: 'occupied' | 'free';
}

interface RealisticVehicleSVGProps {
  category?: VehicleTypeCategory | string;
  seats?: VehicleSeat[];
  onToggleSeat?: (seatId: string) => void;
  interactive?: boolean;
  trunkStatus?: 'VACIO' | 'DISPONIBLE' | 'OCUPADO';
  onToggleTrunk?: () => void;
  bodyColor?: string;
  className?: string;
  plate?: string;
}

export default function RealisticVehicleSVG({
  category = 'SEDAN',
  seats = [],
  onToggleSeat,
  interactive = false,
  trunkStatus = 'DISPONIBLE',
  onToggleTrunk,
  bodyColor = '#f4f4f5',
  className = 'w-full max-w-[280px] h-auto mx-auto',
  plate
}: RealisticVehicleSVGProps) {
  const normCategory = (category || 'SEDAN').toUpperCase();
  const isMototaxi = normCategory.includes('MOTO');
  const isMinivan = normCategory.includes('MINIVAN');
  const isCombi = normCategory.includes('COMBI') || normCategory.includes('BUS') || normCategory.includes('HIACE');
  const isStationWagon = normCategory.includes('STATION') || normCategory.includes('WAGON') || normCategory.includes('SUV') || normCategory.includes('PROBOX');

  const isTrunkFree = trunkStatus !== 'OCUPADO';

  const getSeatStatus = (seatId: string, defaultStatus: 'free' | 'occupied' = 'free'): boolean => {
    const s = seats.find(item => item.id === seatId || item.label.toLowerCase().includes(seatId.toLowerCase()));
    if (!s) return defaultStatus === 'free';
    return s.status === 'free';
  };

  const handleSeatClick = (seatId: string) => {
    if (!interactive || !onToggleSeat) return;
    onToggleSeat(seatId);
  };

  /* =========================================================================
     1. MOTOTAXI BAJAJ TORITO (3 RUEDAS - BARRANCA URBANA)
     ========================================================================= */
  if (isMototaxi) {
    const s1Free = getSeatStatus('s1', 'free');
    const s2Free = getSeatStatus('s2', 'occupied');
    const s3Free = getSeatStatus('s3', 'free');

    return (
      <div className={`relative select-none flex flex-col items-center ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 480" width="100%" height="100%" className="drop-shadow-md">
          <defs>
            <filter id="motoShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#09090b" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Rueda delantera central */}
          <rect x="142" y="25" width="16" height="52" rx="5" fill="#18181b" />

          {/* 2 Ruedas traseras */}
          <rect x="36" y="340" width="16" height="60" rx="5" fill="#18181b" />
          <rect x="248" y="340" width="16" height="60" rx="5" fill="#18181b" />

          {/* Carrocería de Mototaxi (Forma de gota/cabina con carpa) */}
          <path
            d="M 150,55 
               C 175,70 230,120 236,190 
               L 242,400 
               C 242,430 220,445 150,445 
               C 80,445 58,430 58,400 
               L 64,190 
               C 70,120 125,70 150,55 Z"
            fill="#f59e0b"
            stroke="#b45309"
            strokeWidth="3"
            filter="url(#motoShadow)"
          />

          {/* Lona / Carpa Superior con franja blanca */}
          <path d="M 72,185 L 228,185 L 234,395 C 234,420 210,430 150,430 C 90,430 66,420 66,395 Z" fill="#d97706" stroke="#92400e" strokeWidth="2" />
          <rect x="74" y="270" width="152" height="18" fill="#ffffff" opacity="0.85" />
          <text x="150" y="283" fill="#1e3a8a" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="900" textAnchor="middle">
            BARRANCA · UNAB
          </text>

          {/* Faro delantero central */}
          <circle cx="150" cy="65" r="11" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />

          {/* Parabrisas delantero */}
          <path d="M 105,105 C 130,95 170,95 195,105 L 210,155 C 175,148 125,148 90,155 Z" fill="#18181b" stroke="#09090b" strokeWidth="2" />

          {/* Timón y Horquilla */}
          <line x1="110" y1="170" x2="190" y2="170" stroke="#18181b" strokeWidth="6" strokeLinecap="round" />
          <circle cx="150" cy="170" r="5" fill="#ef4444" />

          {/* ASIENTO CHOFER (DELANTERO CENTRAL) */}
          <g id="asiento-chofer-moto">
            <rect x="120" y="195" width="60" height="55" rx="10" fill="#3f3f46" stroke="#18181b" strokeWidth="2" />
            <text x="150" y="228" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">
              CHOFER
            </text>
          </g>

          {/* ASIENTOS TRASEROS DE PASAJEROS (3 PLAZAS) */}
          {/* M1: Pasajero Izq */}
          <g onClick={() => handleSeatClick('s1')} className={interactive ? 'cursor-pointer' : ''}>
            <rect x="74" y="320" width="46" height="65" rx="8" fill={s1Free ? '#22c55e' : '#ef4444'} stroke={s1Free ? '#15803d' : '#b91c1c'} strokeWidth="2" />
            <text x="97" y="352" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">P1</text>
            <text x="97" y="366" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="600" textAnchor="middle">{s1Free ? 'LIBRE' : 'OCUP'}</text>
          </g>

          {/* M2: Pasajero Centro */}
          <g onClick={() => handleSeatClick('s2')} className={interactive ? 'cursor-pointer' : ''}>
            <rect x="127" y="320" width="46" height="65" rx="8" fill={s2Free ? '#22c55e' : '#ef4444'} stroke={s2Free ? '#15803d' : '#b91c1c'} strokeWidth="2" />
            <text x="150" y="352" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">P2</text>
            <text x="150" y="366" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="600" textAnchor="middle">{s2Free ? 'LIBRE' : 'OCUP'}</text>
          </g>

          {/* M3: Pasajero Der */}
          <g onClick={() => handleSeatClick('s3')} className={interactive ? 'cursor-pointer' : ''}>
            <rect x="180" y="320" width="46" height="65" rx="8" fill={s3Free ? '#22c55e' : '#ef4444'} stroke={s3Free ? '#15803d' : '#b91c1c'} strokeWidth="2" />
            <text x="203" y="352" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">P3</text>
            <text x="203" y="366" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="600" textAnchor="middle">{s3Free ? 'LIBRE' : 'OCUP'}</text>
          </g>

          {/* Luces posteriores */}
          <rect x="74" y="434" width="28" height="8" rx="3" fill="#ef4444" stroke="#991b1b" />
          <rect x="198" y="434" width="28" height="8" rx="3" fill="#ef4444" stroke="#991b1b" />
        </svg>

        <div className="mt-2 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Mototaxi Torito · 3 Pasajeros
          </span>
        </div>
      </div>
    );
  }

  /* =========================================================================
     2. MINIVÁN 7 PASAJEROS (TOYOTA AVANZA / ERTIGA)
     ========================================================================= */
  if (isMinivan) {
    const s1Free = getSeatStatus('s1', 'free');
    const s2Free = getSeatStatus('s2', 'occupied');
    const s3Free = getSeatStatus('s3', 'free');
    const s4Free = getSeatStatus('s4', 'free');
    const s5Free = getSeatStatus('s5', 'free');
    const s6Free = getSeatStatus('s6', 'free');

    return (
      <div className={`relative select-none flex flex-col items-center ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 620" width="100%" height="100%" className="drop-shadow-md">
          <defs>
            <filter id="vanShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#09090b" floodOpacity="0.22" />
            </filter>
          </defs>

          {/* 4 Ruedas */}
          <rect x="30" y="110" width="15" height="60" rx="5" fill="#18181b" />
          <rect x="275" y="110" width="15" height="60" rx="5" fill="#18181b" />
          <rect x="30" y="440" width="15" height="60" rx="5" fill="#18181b" />
          <rect x="275" y="440" width="15" height="60" rx="5" fill="#18181b" />

          {/* Carrocería Miniván */}
          <path
            d="M 85,30 C 120,20 200,20 235,30 C 265,45 276,80 276,130 L 276,510 C 276,560 260,585 230,595 C 195,605 125,605 90,595 C 60,585 44,560 44,510 L 44,130 C 44,80 55,45 85,30 Z"
            fill={bodyColor}
            stroke="#27272a"
            strokeWidth="3"
            filter="url(#vanShadow)"
          />

          {/* Retrovisores */}
          <path d="M 44,165 L 18,175 C 15,177 15,187 20,189 L 44,188 Z" fill={bodyColor} stroke="#27272a" strokeWidth="2" />
          <path d="M 276,165 L 302,175 C 305,177 305,187 300,189 L 276,188 Z" fill={bodyColor} stroke="#27272a" strokeWidth="2" />

          {/* Faros */}
          <path d="M 60,50 C 70,38 90,34 105,34 L 95,50 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
          <path d="M 260,50 C 250,38 230,34 215,34 L 225,50 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />

          {/* Parabrisas */}
          <path d="M 72,130 C 115,118 205,118 248,130 L 238,180 C 195,172 125,172 82,180 Z" fill="#27272a" stroke="#18181b" strokeWidth="2" />

          {/* FILA 1: CHOFER Y COPILOTO */}
          <g id="van-chofer">
            <rect x="76" y="210" width="56" height="58" rx="10" fill="#3f3f46" stroke="#18181b" strokeWidth="2" />
            <text x="104" y="244" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">CHOFER</text>
          </g>

          <g onClick={() => handleSeatClick('s1')} className={interactive ? 'cursor-pointer' : ''}>
            <rect x="188" y="210" width="56" height="58" rx="10" fill={s1Free ? '#22c55e' : '#ef4444'} stroke={s1Free ? '#15803d' : '#b91c1c'} strokeWidth="2" />
            <text x="216" y="240" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle">A1</text>
            <text x="216" y="252" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="600" textAnchor="middle">{s1Free ? 'LIBRE' : 'OCUP'}</text>
          </g>

          {/* FILA 2: INTERMEDIA (2 ASIENTOS CON PASILLO) */}
          <g onClick={() => handleSeatClick('s2')} className={interactive ? 'cursor-pointer' : ''}>
            <rect x="76" y="300" width="54" height="56" rx="9" fill={s2Free ? '#22c55e' : '#ef4444'} stroke={s2Free ? '#15803d' : '#b91c1c'} strokeWidth="2" />
            <text x="103" y="330" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">A2</text>
            <text x="103" y="342" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="600" textAnchor="middle">{s2Free ? 'LIBRE' : 'OCUP'}</text>
          </g>

          <g onClick={() => handleSeatClick('s3')} className={interactive ? 'cursor-pointer' : ''}>
            <rect x="190" y="300" width="54" height="56" rx="9" fill={s3Free ? '#22c55e' : '#ef4444'} stroke={s3Free ? '#15803d' : '#b91c1c'} strokeWidth="2" />
            <text x="217" y="330" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">A3</text>
            <text x="217" y="342" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="600" textAnchor="middle">{s3Free ? 'LIBRE' : 'OCUP'}</text>
          </g>

          {/* FILA 3: POSTERIOR (3 ASIENTOS) */}
          <g onClick={() => handleSeatClick('s4')} className={interactive ? 'cursor-pointer' : ''}>
            <rect x="68" y="388" width="54" height="56" rx="9" fill={s4Free ? '#22c55e' : '#ef4444'} stroke={s4Free ? '#15803d' : '#b91c1c'} strokeWidth="2" />
            <text x="95" y="418" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">A4</text>
            <text x="95" y="430" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="600" textAnchor="middle">{s4Free ? 'LIBRE' : 'OCUP'}</text>
          </g>

          <g onClick={() => handleSeatClick('s5')} className={interactive ? 'cursor-pointer' : ''}>
            <rect x="133" y="388" width="54" height="56" rx="9" fill={s5Free ? '#22c55e' : '#ef4444'} stroke={s5Free ? '#15803d' : '#b91c1c'} strokeWidth="2" />
            <text x="160" y="418" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">A5</text>
            <text x="160" y="430" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="600" textAnchor="middle">{s5Free ? 'LIBRE' : 'OCUP'}</text>
          </g>

          <g onClick={() => handleSeatClick('s6')} className={interactive ? 'cursor-pointer' : ''}>
            <rect x="198" y="388" width="54" height="56" rx="9" fill={s6Free ? '#22c55e' : '#ef4444'} stroke={s6Free ? '#15803d' : '#b91c1c'} strokeWidth="2" />
            <text x="225" y="418" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">A6</text>
            <text x="225" y="430" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="8" fontWeight="600" textAnchor="middle">{s6Free ? 'LIBRE' : 'OCUP'}</text>
          </g>

          {/* Luna Posterior */}
          <path d="M 82,475 C 125,482 195,482 238,475 L 228,505 C 190,510 130,510 92,505 Z" fill="#27272a" stroke="#18181b" strokeWidth="2" />

          {/* MALETERA */}
          <g id="van-maletera" onClick={interactive && onToggleTrunk ? onToggleTrunk : undefined} className={interactive ? 'cursor-pointer' : ''}>
            <rect x="76" y="520" width="168" height="52" rx="10" fill={isTrunkFree ? '#dcfce7' : '#fee2e2'} stroke={isTrunkFree ? '#16a34a' : '#dc2626'} strokeWidth="2" strokeDasharray="4 2" />
            <text x="160" y="545" fill="#18181b" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">MALETERA MINIVÁN (350 L)</text>
            <text x="160" y="559" fill={isTrunkFree ? '#15803d' : '#b91c1c'} fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="700" textAnchor="middle">{isTrunkFree ? 'DISPONIBLE' : 'LLENA'}</text>
          </g>

          {/* Luces traseras */}
          <rect x="65" y="585" width="40" height="10" rx="3" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
          <rect x="215" y="585" width="40" height="10" rx="3" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
        </svg>

        <div className="mt-2 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            Miniván Avanza · 6 Pasajeros
          </span>
        </div>
      </div>
    );
  }

  /* =========================================================================
     3. COMBI / MICROBÚS (TOYOTA HIACE / INTERDISTRITAL BARRANCA-SUPE)
     ========================================================================= */
  if (isCombi) {
    return (
      <div className={`relative select-none flex flex-col items-center ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 700" width="100%" height="100%" className="drop-shadow-md">
          {/* Ruedas */}
          <rect x="20" y="120" width="16" height="70" rx="5" fill="#18181b" />
          <rect x="304" y="120" width="16" height="70" rx="5" fill="#18181b" />
          <rect x="20" y="520" width="16" height="70" rx="5" fill="#18181b" />
          <rect x="304" y="520" width="16" height="70" rx="5" fill="#18181b" />

          {/* Carrocería Combi ancha */}
          <rect x="36" y="25" width="268" height="645" rx="24" fill={bodyColor} stroke="#27272a" strokeWidth="3.5" />

          {/* Parabrisas panorámico */}
          <rect x="52" y="75" width="236" height="70" rx="12" fill="#27272a" stroke="#18181b" strokeWidth="2" />
          <text x="170" y="115" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="12" fontWeight="900" textAnchor="middle">
            BARRANCA — SUPE — PATIVILCA
          </text>

          {/* Fila 1: Chofer y Copiloto */}
          <g>
            <rect x="58" y="165" width="58" height="54" rx="8" fill="#3f3f46" stroke="#18181b" strokeWidth="2" />
            <text x="87" y="197" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">CHOFER</text>
          </g>
          <g onClick={() => handleSeatClick('s1')} className={interactive ? 'cursor-pointer' : ''}>
            <rect x="224" y="165" width="58" height="54" rx="8" fill={getSeatStatus('s1', 'free') ? '#22c55e' : '#ef4444'} stroke="#15803d" strokeWidth="2" />
            <text x="253" y="197" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">A1 COPILOTO</text>
          </g>

          {/* Filas 2, 3, 4 (2 a la izq, 1 a la der) */}
          {[
            { y: 240, ids: ['s2', 's3', 's4'], labels: ['A2', 'A3', 'A4'] },
            { y: 315, ids: ['s5', 's6', 's7'], labels: ['A5', 'A6', 'A7'] },
            { y: 390, ids: ['s8', 's9', 's10'], labels: ['A8', 'A9', 'A10'] }
          ].map((row, idx) => (
            <g key={idx}>
              <g onClick={() => handleSeatClick(row.ids[0])} className={interactive ? 'cursor-pointer' : ''}>
                <rect x="58" y={row.y} width="46" height="52" rx="7" fill={getSeatStatus(row.ids[0], 'free') ? '#22c55e' : '#ef4444'} stroke="#15803d" strokeWidth="1.5" />
                <text x="81" y={row.y + 30} fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" textAnchor="middle">{row.labels[0]}</text>
              </g>
              <g onClick={() => handleSeatClick(row.ids[1])} className={interactive ? 'cursor-pointer' : ''}>
                <rect x="110" y={row.y} width="46" height="52" rx="7" fill={getSeatStatus(row.ids[1], 'free') ? '#22c55e' : '#ef4444'} stroke="#15803d" strokeWidth="1.5" />
                <text x="133" y={row.y + 30} fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" textAnchor="middle">{row.labels[1]}</text>
              </g>
              <g onClick={() => handleSeatClick(row.ids[2])} className={interactive ? 'cursor-pointer' : ''}>
                <rect x="236" y={row.y} width="46" height="52" rx="7" fill={getSeatStatus(row.ids[2], 'free') ? '#22c55e' : '#ef4444'} stroke="#15803d" strokeWidth="1.5" />
                <text x="259" y={row.y + 30} fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" textAnchor="middle">{row.labels[2]}</text>
              </g>
            </g>
          ))}

          {/* Fila de fondo (4 asientos continuos) */}
          {['s11', 's12', 's13', 's14'].map((id, i) => (
            <g key={id} onClick={() => handleSeatClick(id)} className={interactive ? 'cursor-pointer' : ''}>
              <rect x={58 + i * 57} y="470" width="50" height="54" rx="7" fill={getSeatStatus(id, 'free') ? '#22c55e' : '#ef4444'} stroke="#15803d" strokeWidth="1.5" />
              <text x={83 + i * 57} y="502" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" textAnchor="middle">A{11 + i}</text>
            </g>
          ))}

          {/* Bodega / Maletera de Combi */}
          <rect x="58" y="550" width="224" height="60" rx="10" fill={isTrunkFree ? '#dcfce7' : '#fee2e2'} stroke={isTrunkFree ? '#16a34a' : '#dc2626'} strokeWidth="2" strokeDasharray="4 2" />
          <text x="170" y="576" fill="#18181b" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">BODEGA POSTERIOR COMBI</text>
          <text x="170" y="592" fill={isTrunkFree ? '#15803d' : '#b91c1c'} fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" textAnchor="middle">{isTrunkFree ? 'ESPACIO LIBRE' : 'BODEGA LLENA'}</text>
        </svg>

        <div className="mt-2 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            Combi HiAce · 14 Pasajeros
          </span>
        </div>
      </div>
    );
  }

  /* =========================================================================
     4. SUV / STATION WAGON CON PORTAEQUIPAJE (PROBOX / RUSH)
     ========================================================================= */
  if (isStationWagon) {
    const isA1Free = getSeatStatus('s1', 'free');
    const isA2Free = getSeatStatus('s2', 'occupied');
    const isA3Free = getSeatStatus('s3', 'free');
    const isA4Free = getSeatStatus('s4', 'free');

    return (
      <div className={`relative select-none flex flex-col items-center ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 600" width="100%" height="100%" className="drop-shadow-md">
          {/* Ruedas */}
          <rect x="30" y="105" width="15" height="62" rx="5" fill="#18181b" />
          <rect x="275" y="105" width="15" height="62" rx="5" fill="#18181b" />
          <rect x="30" y="420" width="15" height="62" rx="5" fill="#18181b" />
          <rect x="275" y="420" width="15" height="62" rx="5" fill="#18181b" />

          {/* Carrocería Station Wagon */}
          <path
            d="M 85,32 C 120,20 200,20 235,32 C 265,46 276,80 276,125 L 276,495 C 276,545 260,575 230,585 C 195,595 125,595 90,585 C 60,575 44,545 44,495 L 44,125 C 44,80 55,46 85,32 Z"
            fill={bodyColor}
            stroke="#27272a"
            strokeWidth="3"
          />

          {/* Barras de Techo Portaequipaje (Roof Rack) */}
          <line x1="68" y1="180" x2="68" y2="440" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
          <line x1="252" y1="180" x2="252" y2="440" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
          <line x1="68" y1="230" x2="252" y2="230" stroke="#334155" strokeWidth="3.5" />
          <line x1="68" y1="330" x2="252" y2="330" stroke="#334155" strokeWidth="3.5" />
          <line x1="68" y1="410" x2="252" y2="410" stroke="#334155" strokeWidth="3.5" />

          {/* Parabrisas */}
          <path d="M 75,140 C 115,126 205,126 245,140 L 234,192 C 195,184 125,184 86,192 Z" fill="#27272a" stroke="#18181b" strokeWidth="2" />

          {/* Chofer y Copiloto */}
          <g>
            <rect x="80" y="225" width="58" height="60" rx="10" fill="#3f3f46" stroke="#18181b" strokeWidth="2" />
            <text x="109" y="258" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">CHOFER</text>
          </g>
          <g onClick={() => handleSeatClick('s1')} className={interactive ? 'cursor-pointer' : ''}>
            <rect x="182" y="225" width="58" height="60" rx="10" fill={isA1Free ? '#22c55e' : '#ef4444'} stroke="#15803d" strokeWidth="2" />
            <text x="211" y="254" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle">A1</text>
            <text x="211" y="267" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="600" textAnchor="middle">{isA1Free ? 'LIBRE' : 'OCUP'}</text>
          </g>

          {/* Fila Trasera (3 Asientos) */}
          <g onClick={() => handleSeatClick('s2')} className={interactive ? 'cursor-pointer' : ''}>
            <rect x="74" y="315" width="52" height="58" rx="8" fill={isA2Free ? '#22c55e' : '#ef4444'} stroke="#15803d" strokeWidth="2" />
            <text x="100" y="348" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">A2</text>
          </g>
          <g onClick={() => handleSeatClick('s3')} className={interactive ? 'cursor-pointer' : ''}>
            <rect x="134" y="315" width="52" height="58" rx="8" fill={isA3Free ? '#22c55e' : '#ef4444'} stroke="#15803d" strokeWidth="2" />
            <text x="160" y="348" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">A3</text>
          </g>
          <g onClick={() => handleSeatClick('s4')} className={interactive ? 'cursor-pointer' : ''}>
            <rect x="194" y="315" width="52" height="58" rx="8" fill={isA4Free ? '#22c55e' : '#ef4444'} stroke="#15803d" strokeWidth="2" />
            <text x="220" y="348" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">A4</text>
          </g>

          {/* Maletera Grande Station Wagon */}
          <g onClick={interactive && onToggleTrunk ? onToggleTrunk : undefined} className={interactive ? 'cursor-pointer' : ''}>
            <rect x="74" y="450" width="172" height="95" rx="10" fill={isTrunkFree ? '#dcfce7' : '#fee2e2'} stroke={isTrunkFree ? '#16a34a' : '#dc2626'} strokeWidth="2" strokeDasharray="4 2" />
            <text x="160" y="490" fill="#18181b" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="800" textAnchor="middle">MALETERA EXTENDIDA (650 L)</text>
            <text x="160" y="508" fill={isTrunkFree ? '#15803d' : '#b91c1c'} fontFamily="system-ui, sans-serif" fontSize="9.5" fontWeight="700" textAnchor="middle">
              {isTrunkFree ? 'CAPACIDAD DE CARGA AMPLIA' : 'CARGA MÁXIMA ALCANZADA'}
            </text>
          </g>
        </svg>

        <div className="mt-2 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Station Wagon / SUV Probox · 4 Pasajeros + Gran Carga
          </span>
        </div>
      </div>
    );
  }

  /* =========================================================================
     5. SEDÁN ESTÁNDAR (TOYOTA YARIS / CHEVROLET SAIL - TU DISEÑO SVG FIEL)
     ========================================================================= */
  const isA1Free = getSeatStatus('s1', 'free');
  const isA2Free = getSeatStatus('s2', 'occupied');
  const isA3Free = getSeatStatus('s3', 'free');
  const isA4Free = getSeatStatus('s4', 'free');

  return (
    <div className={`relative select-none flex flex-col items-center ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 580"
        width="100%"
        height="100%"
        className="drop-shadow-md transition-all duration-300"
      >
        <defs>
          <filter id="carShadowFmt" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#09090b" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* 4 Ruedas */}
        <rect x="34" y="105" width="14" height="58" rx="5" fill="#18181b" />
        <rect x="272" y="105" width="14" height="58" rx="5" fill="#18181b" />
        <rect x="34" y="405" width="14" height="58" rx="5" fill="#18181b" />
        <rect x="272" y="405" width="14" height="58" rx="5" fill="#18181b" />

        {/* Carrocería */}
        <path
          d="M 85,35 C 120,22 200,22 235,35 C 262,48 274,80 274,125 L 274,455 C 274,505 260,535 230,545 C 195,555 125,555 90,545 C 60,535 46,505 46,455 L 46,125 C 46,80 58,48 85,35 Z"
          fill={bodyColor}
          stroke="#27272a"
          strokeWidth="3"
          filter="url(#carShadowFmt)"
        />

        {/* Retrovisores */}
        <path d="M 46,165 L 22,175 C 18,177 18,187 23,189 L 46,188 Z" fill={bodyColor} stroke="#27272a" strokeWidth="2" />
        <path d="M 274,165 L 298,175 C 302,177 302,187 297,189 L 274,188 Z" fill={bodyColor} stroke="#27272a" strokeWidth="2" />

        {/* Faros y Luces */}
        <path d="M 62,55 C 72,42 90,37 105,37 L 95,55 C 80,55 68,58 62,55 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
        <path d="M 258,55 C 248,42 230,37 215,37 L 225,55 C 240,55 252,58 258,55 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
        <path d="M 65,532 C 78,542 95,546 112,546 L 105,532 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
        <path d="M 255,532 C 242,542 225,546 208,546 L 215,532 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />

        {/* Capó y Parabrisas */}
        <path d="M 85,62 L 100,135 M 235,62 L 220,135" stroke="#d4d4d8" strokeWidth="2" fill="none" />
        <path d="M 75,142 C 115,128 205,128 245,142 L 234,195 C 195,186 125,186 86,195 Z" fill="#27272a" stroke="#18181b" strokeWidth="2" />

        {/* Habitáculo */}
        <rect x="68" y="198" width="184" height="215" rx="14" fill="#fafafa" stroke="#d4d4d8" strokeWidth="1.5" />
        <path d="M 72,202 L 248,202 L 244,218 L 76,218 Z" fill="#e4e4e7" stroke="#71717a" strokeWidth="1.5" />
        <circle cx="112" cy="222" r="14" fill="none" stroke="#18181b" strokeWidth="3.5" />

        {/* ASIENTO CHOFER */}
        <g id="asiento-conductor">
          <rect x="82" y="238" width="60" height="62" rx="10" fill="#3f3f46" stroke="#18181b" strokeWidth="2" />
          <text x="112" y="272" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle">CHOFER</text>
        </g>

        {/* ASIENTO A1: COPILOTO */}
        <g id="asiento-A1" onClick={() => handleSeatClick('s1')} className={interactive ? 'cursor-pointer' : ''}>
          <rect x="178" y="238" width="60" height="62" rx="10" fill={isA1Free ? '#22c55e' : '#ef4444'} stroke={isA1Free ? '#15803d' : '#b91c1c'} strokeWidth="2" />
          <text x="208" y="268" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle">A1</text>
          <text x="208" y="281" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" textAnchor="middle">{isA1Free ? 'LIBRE' : 'OCUPADO'}</text>
        </g>

        {/* FILA TRASERA A2, A3, A4 */}
        <g id="asiento-A2" onClick={() => handleSeatClick('s2')} className={interactive ? 'cursor-pointer' : ''}>
          <rect x="76" y="335" width="52" height="60" rx="9" fill={isA2Free ? '#22c55e' : '#ef4444'} stroke={isA2Free ? '#15803d' : '#b91c1c'} strokeWidth="2" />
          <text x="102" y="364" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle">A2</text>
          <text x="102" y="377" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="600" textAnchor="middle">{isA2Free ? 'LIBRE' : 'OCUP'}</text>
        </g>

        <g id="asiento-A3" onClick={() => handleSeatClick('s3')} className={interactive ? 'cursor-pointer' : ''}>
          <rect x="134" y="335" width="52" height="60" rx="9" fill={isA3Free ? '#22c55e' : '#ef4444'} stroke={isA3Free ? '#15803d' : '#b91c1c'} strokeWidth="2" />
          <text x="160" y="364" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle">A3</text>
          <text x="160" y="377" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="600" textAnchor="middle">{isA3Free ? 'LIBRE' : 'OCUP'}</text>
        </g>

        <g id="asiento-A4" onClick={() => handleSeatClick('s4')} className={interactive ? 'cursor-pointer' : ''}>
          <rect x="192" y="335" width="52" height="60" rx="9" fill={isA4Free ? '#22c55e' : '#ef4444'} stroke={isA4Free ? '#15803d' : '#b91c1c'} strokeWidth="2" />
          <text x="218" y="364" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="11" fontWeight="700" textAnchor="middle">A4</text>
          <text x="218" y="377" fill="#ffffff" fontFamily="system-ui, sans-serif" fontSize="8.5" fontWeight="600" textAnchor="middle">{isA4Free ? 'LIBRE' : 'OCUP'}</text>
        </g>

        {/* Luna Posterior y Maletera */}
        <path d="M 82,418 C 125,425 195,425 238,418 L 228,452 C 190,458 130,458 92,452 Z" fill="#27272a" stroke="#18181b" strokeWidth="2" />

        <g id="zona-maletera" onClick={interactive && onToggleTrunk ? onToggleTrunk : undefined} className={interactive ? 'cursor-pointer' : ''}>
          <rect x="82" y="462" width="156" height="62" rx="10" fill={isTrunkFree ? '#dcfce7' : '#fee2e2'} stroke={isTrunkFree ? '#16a34a' : '#dc2626'} strokeWidth="2" strokeDasharray="4 2" />
          <text x="160" y="490" fill="#18181b" fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="700" textAnchor="middle">MALETERA (476 L)</text>
          <text x="160" y="505" fill={isTrunkFree ? '#15803d' : '#b91c1c'} fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" textAnchor="middle">
            {isTrunkFree ? 'ESPACIO DISPONIBLE' : 'CARGA COMPLETA'}
          </text>
        </g>
      </svg>

      <div className="mt-2 text-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
          Sedán Colectivo · 4 Pasajeros
        </span>
      </div>
    </div>
  );
}
