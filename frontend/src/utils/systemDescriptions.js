// Copy provided verbatim by the WR Energy team — do not rewrite.
// Keyed by codigo_estacion (backend's station code, matches image filename prefixes).
const DESCRIPTIONS = {
  'EFRIVER3Plus-US-SP-CBox':
    'Perfecta para un día de playa o una noche de acampada: cabe en una mochila y te da hasta 600W de energía (1200W en ráfaga) para cargar celulares, mantener un router prendido o una hielera eléctrica funcionando toda la tarde. Ligera, silenciosa, y lista para salir contigo cuando quieras desconectarte sin quedarte sin batería.',
  'EFRIVER3Max-US':
    'El compañero ideal para un grupo de amigos en la playa o un fin de semana de campamento: con 600W de salida (1200W en ráfaga) alimenta luces, bocinas, ventiladores y varios celulares a la vez, y con su batería adicional extraíble puedes duplicar su autonomía si la noche se alarga.',
  'EFDELTA3-LA-CBox':
    'Un sistema híbrido: tan portátil como para llevarlo a la playa un fin de semana, pero con la potencia suficiente para respaldar lo esencial de tu casa durante un apagón — router, laptop, ventiladores y hasta el refri por varias horas. Con 1800W de salida y carga completa en menos de una hora, es tu punto medio entre movilidad y tranquilidad en casa.',
  'EFDELTA1500-US':
    'Igual de portátil que su hermano menor, pero con más músculo: 1800W de salida (3600W en ráfaga) y capacidad ampliable hasta 5,500Wh. Perfecto si quieres un sistema que un día te acompañe a la playa con amigos y al siguiente respalde tu home office completo — laptop, router y ventilador — durante un apagón largo.',
  'EFDELTA2Max-US':
    'Pensado para quedarse en casa: con 2,048Wh de capacidad (ampliable hasta 6,144Wh) mantiene tu refrigerador funcionando hasta 14 horas seguidas durante un apagón, sin que se eche a perder nada. Con 2,400W de salida cubre prácticamente cualquier electrodoméstico de tu cocina, y su batería está diseñada para durar cerca de 10 años de uso diario.',
  'DELTAPro-1600W-US':
    'El respaldo doméstico robusto que se instala una vez y se olvida: con 3,600W de salida (7,200W en ráfaga) y capacidad ampliable hasta 25kWh, cubre el 99% de los aparatos de una casa completa — clima, bomba de agua, refrigerador y más — durante apagones prolongados, no solo unas horas.',
  'EFDELTAPRO3-US':
    'Para una casa grande que no puede darse el lujo de quedarse sin luz: 4,000W de salida (6,000W en ráfaga, hasta 12,000W combinando unidades) alimentan un aire acondicionado central de 3 toneladas o una bomba de agua de 1 HP sin esfuerzo. Su batería resiste agua, polvo e impactos (IP65) y está pensada para durar más de 10 años — tranquilidad real, no solo para la próxima tormenta.',
  'EFDeltaProUltra-US':
    'La solución de respaldo para el hogar más potente que existe hoy: con 7,200W de salida, hace funcionar sin esfuerzo hasta un aire acondicionado central de 3 toneladas. Con una sola torre (estación + batería) ya tienes más de 30 días de energía de respaldo para lo esencial de tu casa — luces, refrigerador, bombas — y es apilable, así que crece contigo si más adelante necesitas más autonomía.',
}

// Delta Pro Ultra gets a second copy variant once it's configured with 2+ battery towers
// (hotel / large-residence configuration via the Smart Home Panel).
const DELTA_PRO_ULTRA_ADVANCED =
  'Cuando una casa grande o un hotel boutique no puede permitirse un apagón: combinando 2-3 torres con el Smart Home Panel, esta configuración entrega hasta 21,600W de salida — suficiente para energizar habitaciones completas, áreas comunes y equipos críticos de forma simultánea. Cambio automático en milisegundos, monitoreo en tiempo real desde la app, y la posibilidad de seguir expandiendo la capacidad conforme crece tu operación.'

export function getSystemDescription(codigoEstacion, nBaterias = 0) {
  if (codigoEstacion === 'EFDeltaProUltra-US' && nBaterias >= 2) {
    return DELTA_PRO_ULTRA_ADVANCED
  }
  return DESCRIPTIONS[codigoEstacion] || ''
}
