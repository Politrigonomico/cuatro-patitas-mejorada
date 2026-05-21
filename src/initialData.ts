import { Pet, CastrationCampaign, CastrationAppointment, AdoptionApplication, Testimonial } from './types';

export const initialPets: Pet[] = [
  {
    id: 'pet_1',
    name: 'Milo',
    breed: 'Labrador Mestizo',
    age: '6 meses',
    size: 'Mediano',
    gender: 'Macho',
    description: 'Milo es un cachorro sumamente alegre, cariñoso y juguetón. Fue encontrado en una autopista buscando comida. Es muy activo, sociable con otros perros y le encanta correr tras la pelota. Ideal para familias activas o con niños que disfruten jugar con él.',
    status: 'En adopción',
    photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
    addedAt: '2026-05-10'
  },
  {
    id: 'pet_2',
    name: 'Luna',
    breed: 'Gato Común Europeo',
    age: '2 años',
    size: 'Chico',
    gender: 'Hembra',
    description: 'Luna es una gata súper tranquila, dulce y mimosa. Fue rescatada de un baldío con sus gatitos, quienes ya fueron todos adoptados. Ahora es el turno de Luna para encontrar un hogar cálido. Es muy de estar adentro, le gusta dormir en lugares soleados y ronronear apenas te acercas.',
    status: 'En adopción',
    photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600',
    addedAt: '2026-05-12'
  },
  {
    id: 'pet_3',
    name: 'Roco',
    breed: 'Boxer Mestizo (Senior)',
    age: '8 años',
    size: 'Grande',
    gender: 'Macho',
    description: 'Roco es nuestro gigante buenazo. Vivió en la calle muchos años hasta que fue atropellado y curado por nuestros voluntarios. Es extremadamente educado, camina de forma perfecta con correa, sabe sentarse y es muy protector y agradecido. Roco merece pasar su vejez en un sillón mullido lleno de amor.',
    status: 'En adopción',
    photo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600',
    addedAt: '2026-05-05'
  },
  {
    id: 'pet_4',
    name: 'Cleo',
    breed: 'Gata Atigrada',
    age: '3 meses',
    size: 'Chico',
    gender: 'Hembra',
    description: 'Cleo es una pequeña bola de energía. Fue rescatada de una caja de cartón en una plaza. Curiosa, intrépida y sumamente juguetona, le apasiona trepar y cazar juguetitos de lana. Convive excelente con gatos adultos y busca un hogar dinámico donde le brinden mucha atención y juego.',
    status: 'En adopción',
    photo: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=600',
    addedAt: '2026-05-15'
  },
  {
    id: 'pet_5',
    name: 'Fiona',
    breed: 'Ovejero Mestizo',
    age: '1 año',
    size: 'Grande',
    gender: 'Hembra',
    description: 'Rescatada de un caso judicial por maltrato. Al principio es bastante tímida y miedosa, pero una vez que te conoce y gana confianza, se vuelve la perra más fiel y dulce del mundo. Necesita un adoptante paciente y un entorno tranquilo para seguir floreciendo.',
    status: 'Recuperándose',
    photo: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=600',
    addedAt: '2026-05-01'
  }
];

export const initialCampaigns: CastrationCampaign[] = [
  {
    id: 'camp_1',
    title: 'Campaña de Castración Gratuita Fighiera',
    description: 'Protegé la salud de tu mascota y colaborá con el control de la población callejera de animales. Cirugías seguras con profesionales matriculados.',
    type: 'castration',
    fecha: '15 de Junio, 2026',
    lugar: 'Centro de Jubilados - Fighiera, Santa Fe',
    maxSlots: 50,
    totalRegistered: 42,
    active: true
  },
  {
    id: 'camp_2',
    title: 'Operativo Integrado: Vacunación Antirrábica & Desparasitación',
    description: 'Campaña obligatoria anual y desparasitación gratuita para felinos y caninos desde los 3 meses de edad. Asegurá tu dosis reservando online.',
    type: 'vaccination',
    fecha: '22 de Junio, 2026',
    lugar: 'Plaza Central de Fighiera, Santa Fe',
    maxSlots: 100,
    totalRegistered: 48,
    active: true
  },
  {
    id: 'camp_3',
    title: 'Colecta y Donativo Solidario: Cuatro Patitas Fighiera',
    description: '¡Ayudanos a alimentar y curar rescates! Colaborá con nuestra red de hogares de tránsito. Comprá artículos solidarios (calendarios, remeras, llaveros) o hacé una donación directa de manera virtual.',
    type: 'fundraiser',
    fecha: 'Todo el mes de Junio',
    lugar: 'Portal Digital Cuatro Patitas & Donaciones Directas',
    goalAmount: 300000,
    collectedAmount: 125000,
    active: true
  }
];

export const initialAppointments: CastrationAppointment[] = [
  {
    id: 'turno_1',
    campaignId: 'camp_1',
    campaignDate: '15 de Junio, 2026',
    ownerName: 'Juan Pérez',
    ownerEmail: 'juan@perez.com',
    ownerDni: '12345678',
    ownerPhone: '1122334455',
    petName: 'Firulais',
    petType: 'Perro',
    petAge: '2 años',
    petWeight: '15 kg',
    status: 'Aprobado',
    note: 'Turno confirmado para las 09:30 hs. Recordar traer al perro con correa, bozal si es reactivo, y 12 hs de ayuno de sólidos/líquidos.',
    createdAt: '2026-05-14'
  },
  {
    id: 'turno_2',
    campaignId: 'camp_1',
    campaignDate: '15 de Junio, 2026',
    ownerName: 'Maria Gomez',
    ownerEmail: 'maria@gomez.com',
    ownerDni: '87654321',
    ownerPhone: '1144556677',
    petName: 'Michi',
    petType: 'Gato',
    petAge: '8 meses',
    petWeight: '3 kg',
    status: 'Pendiente',
    createdAt: '2026-05-18'
  }
];

export const initialAdoptions: AdoptionApplication[] = [
  {
    id: 'adop_1',
    petId: 'pet_1',
    petName: 'Milo',
    adopterName: 'Carlos López',
    adopterEmail: 'carlos@lopez.com',
    adopterDni: '12345678',
    adopterPhone: '1155667788',
    answers: {
      homeType: 'Casa con patio grande',
      otherPets: 'No',
      yardSecure: 'Sí, totalmente tapialado',
      hoursAlone: '3 horas',
      agreement: true
    },
    status: 'Pendiente',
    createdAt: '2026-05-16'
  },
  {
    id: 'adop_2',
    petId: 'pet_3',
    petName: 'Roco',
    adopterName: 'Ana Martínez',
    adopterEmail: 'ana@martinez.com',
    adopterDni: '11112222',
    adopterPhone: '1133221100',
    answers: {
      homeType: 'Departamento amplio',
      otherPets: 'Sí, un caniche viejo',
      yardSecure: 'No aplicable (edificio con balcón protegido con red)',
      hoursAlone: '5 horas',
      agreement: true
    },
    status: 'Rechazado',
    note: 'Hola Ana, agradecemos mucho tu postulación para Roco. Debido a su tamaño grande y antecedentes de calle con problemas articulares, priorizamos para él una casa sin escaleras de acceso directo a patios, ya que subir/bajar escalones le cuesta bastante. Te sugerimos postularte para Luna, quien se adaptaría de forma óptima a tu departamento.',
    createdAt: '2026-05-15'
  }
];

export const initialTestimonials: Testimonial[] = [
  {
    id: 'test_1',
    petName: 'Simba',
    adopterName: 'Romina & Tomás',
    story: 'Simba llegó a nuestras vidas después de estar 3 meses refugiado por neumonía. Hoy es el rey indiscutible de todo el departamento. Duerme en nuestra almohada, nos acompaña en cada llamada de Home Office y nos llena de ronroneos. ¡Adoptar un gato adulto es la mejor decisión que tomamos!',
    photoUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=600',
    date: '2026-04-10'
  },
  {
    id: 'test_2',
    petName: 'Brisa',
    adopterName: 'Familia Di Marco',
    story: 'Brisa fue rescatada en una caja de cartón abandonada junto a sus hermanitos. Vivía saltando cercos de la ansiedad, pero en casa, con paciencia y paseos diarios, aprendió a canalizar su dinamismo. Ahora es la mejor compañera de paseos por el campo y no se separa un segundo de los nenes.',
    photoUrl: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=600',
    date: '2025-12-18'
  },
  {
    id: 'test_3',
    petName: 'Pipo',
    adopterName: 'Abuela Marta',
    story: 'Pipo tiene una patita más corta y un ojito curado, pero su corazón no conoce de límites. Es el compañero perfecto para Marta, una abuela que vive sola. Se cuidan mutuamente, caminan despacito por la manzana todas las tardes, y se acurrucan juntos a mirar novelas. Son una dupla inseparable.',
    photoUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=600',
    date: '2026-02-05'
  }
];

export const initialFinances = [
  {
    id: 'fin_1',
    type: 'revenue' as const,
    category: 'Donación',
    amount: 55000,
    description: 'Donación mensual solidaria vía transferencia bancaria',
    date: '2026-05-15',
    createdAt: '2026-05-15'
  },
  {
    id: 'fin_2',
    type: 'expense' as const,
    category: 'Alimento',
    amount: 32000,
    description: 'Compra de 2 bolsas de alimento balanceado para cachorros',
    date: '2026-05-18',
    createdAt: '2026-05-18'
  },
  {
    id: 'fin_3',
    type: 'expense' as const,
    category: 'Veterinaria',
    amount: 18500,
    description: 'Inspección veterinaria y medicamento para Roco',
    date: '2026-05-19',
    createdAt: '2026-05-19'
  },
  {
    id: 'fin_4',
    type: 'revenue' as const,
    category: 'Apadrinamiento',
    amount: 15000,
    description: 'Padrino de Fiona: Aporte correspondiente a Mayo',
    date: '2026-05-20',
    createdAt: '2026-05-20'
  }
];

export const initialHistoricAdopters = [
  {
    id: 'hist_1',
    adopterName: 'Roberto Gómez',
    adopterDni: '15432987',
    adopterPhone: '3416554433',
    adopterEmail: 'roberto.gomez@gmail.com',
    petName: 'Rocky',
    petBreed: 'Ovejero Cruzado',
    adoptionDate: '2023-11-20',
    notes: 'Registro cargado desde archivo papel 2023. Se hizo control telefónico satisfactorio en 2024.',
    createdAt: '2026-05-20'
  },
  {
    id: 'hist_2',
    adopterName: 'Marcela Silveyra',
    adopterDni: '24987654',
    adopterPhone: '3414998877',
    adopterEmail: 'marcela.silveyra@hotmail.com',
    petName: 'Pelusa',
    petBreed: 'Gato Siamés',
    adoptionDate: '2024-04-12',
    notes: 'Rescate de calle Fighiera. Se entrega castrada según registro firmado papel N° 12.',
    createdAt: '2026-05-20'
  }
];
