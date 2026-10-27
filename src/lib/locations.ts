// Curated Nigeria-first cascading location dataset.
// Used for filter dropdowns: Country → State → LGA → Area → Bus stop.
// Each leaf includes optional coordinates so the radius filter can centre on it.

export type AreaPoint = { name: string; lat: number; lng: number; busStops?: string[] };
export type Lga = { name: string; areas: AreaPoint[] };
export type State = { name: string; lgas: Lga[] };
export type Country = { code: string; name: string; states: State[] };

export const COUNTRIES: Country[] = [
  {
    code: "NG",
    name: "Nigeria",
    states: [
      {
        name: "Lagos",
        lgas: [
          {
            name: "Eti-Osa",
            areas: [
              {
                name: "Lekki Phase 1",
                lat: 6.4474,
                lng: 3.4732,
                busStops: ["Admiralty Way", "Ikate Roundabout", "Lekki Toll Gate", "Marwa Bus Stop"],
              },
              {
                name: "Victoria Island",
                lat: 6.4281,
                lng: 3.4216,
                busStops: ["Falomo", "Bar Beach", "Law School", "Ozumba Mbadiwe"],
              },
              {
                name: "Ikoyi",
                lat: 6.45,
                lng: 3.435,
                busStops: ["Awolowo Road", "Falomo Bridge", "Dolphin Estate"],
              },
              {
                name: "Ajah",
                lat: 6.4669,
                lng: 3.5853,
                busStops: ["Ajah Roundabout", "Sangotedo", "Abraham Adesanya"],
              },
            ],
          },
          {
            name: "Ikeja",
            areas: [
              {
                name: "Ikeja GRA",
                lat: 6.5833,
                lng: 3.35,
                busStops: ["Allen Avenue", "Computer Village", "Ikeja Underbridge", "Maryland"],
              },
              {
                name: "Opebi",
                lat: 6.5878,
                lng: 3.358,
                busStops: ["Salvation", "Opebi Roundabout"],
              },
              {
                name: "Oregun",
                lat: 6.6028,
                lng: 3.3653,
                busStops: ["Oregun Bus Stop", "Kudirat Abiola Way"],
              },
            ],
          },
          {
            name: "Surulere",
            areas: [
              {
                name: "Surulere",
                lat: 6.4969,
                lng: 3.359,
                busStops: ["National Stadium", "Aguda", "Bode Thomas", "Ojuelegba"],
              },
            ],
          },
          {
            name: "Lagos Mainland",
            areas: [
              {
                name: "Yaba",
                lat: 6.5095,
                lng: 3.3711,
                busStops: ["Yaba Tech", "Sabo", "Jibowu", "Costain"],
              },
              {
                name: "Ebute Metta",
                lat: 6.4869,
                lng: 3.3866,
                busStops: ["Iddo", "Oyingbo", "Otto"],
              },
            ],
          },
          {
            name: "Kosofe",
            areas: [
              {
                name: "Magodo",
                lat: 6.6203,
                lng: 3.3776,
                busStops: ["CMD Road", "Magodo Phase 2", "Shangisha"],
              },
              {
                name: "Ojota",
                lat: 6.5862,
                lng: 3.3812,
                busStops: ["Ojota New Garage", "Motorways"],
              },
            ],
          },
          {
            name: "Lagos Island",
            areas: [
              {
                name: "Marina",
                lat: 6.4506,
                lng: 3.3941,
                busStops: ["CMS", "Marina Bus Stop", "Ebute Ero"],
              },
              {
                name: "Lagos Island Central",
                lat: 6.4549,
                lng: 3.3944,
                busStops: ["Idumota", "Balogun Market", "Tinubu Square"],
              },
            ],
          },
        ],
      },
      {
        name: "FCT - Abuja",
        lgas: [
          {
            name: "Abuja Municipal",
            areas: [
              {
                name: "Wuse 2",
                lat: 9.0833,
                lng: 7.4833,
                busStops: ["Banex Plaza", "Aminu Kano Crescent"],
              },
              {
                name: "Garki",
                lat: 9.0383,
                lng: 7.4951,
                busStops: ["Area 1", "Area 11", "Garki Market"],
              },
              {
                name: "Maitama",
                lat: 9.0917,
                lng: 7.4917,
                busStops: ["Aso Drive", "IBB Way"],
              },
            ],
          },
          {
            name: "Gwagwalada",
            areas: [
              {
                name: "Gwagwalada",
                lat: 8.9436,
                lng: 7.0833,
                busStops: ["UATH Junction", "Phase 3 Junction"],
              },
            ],
          },
        ],
      },
      {
        name: "Rivers",
        lgas: [
          {
            name: "Port Harcourt",
            areas: [
              {
                name: "GRA Phase 2",
                lat: 4.8156,
                lng: 7.0498,
                busStops: ["Aba Road", "Stadium Road", "Olu Obasanjo"],
              },
              {
                name: "D-Line",
                lat: 4.8101,
                lng: 7.0142,
                busStops: ["Mile 1 Market", "Olu Obasanjo Roundabout"],
              },
            ],
          },
          {
            name: "Obio-Akpor",
            areas: [
              {
                name: "Rumuokoro",
                lat: 4.8755,
                lng: 6.998,
                busStops: ["Rumuokoro Roundabout", "Eliozu"],
              },
            ],
          },
        ],
      },
      {
        name: "Oyo",
        lgas: [
          {
            name: "Ibadan North",
            areas: [
              {
                name: "Bodija",
                lat: 7.4356,
                lng: 3.9001,
                busStops: ["Bodija Market", "U.I. Gate", "Sango"],
              },
              {
                name: "Mokola",
                lat: 7.4106,
                lng: 3.8852,
                busStops: ["Mokola Roundabout", "Total Garden"],
              },
            ],
          },
          {
            name: "Ibadan South-West",
            areas: [
              {
                name: "Ring Road",
                lat: 7.3514,
                lng: 3.8606,
                busStops: ["Challenge", "Molete", "Iwo Road"],
              },
            ],
          },
        ],
      },
      {
        name: "Edo",
        lgas: [
          {
            name: "Oredo",
            areas: [
              {
                name: "GRA Benin",
                lat: 6.335,
                lng: 5.6037,
                busStops: ["Ring Road", "King's Square", "New Benin"],
              },
            ],
          },
        ],
      },
      {
        name: "Kano",
        lgas: [
          {
            name: "Kano Municipal",
            areas: [
              {
                name: "Sabon Gari",
                lat: 12.0022,
                lng: 8.592,
                busStops: ["Kano Line", "Tudun Wada", "Bata Junction"],
              },
            ],
          },
        ],
      },
      {
        name: "Enugu",
        lgas: [
          {
            name: "Enugu North",
            areas: [
              {
                name: "Independence Layout",
                lat: 6.4402,
                lng: 7.4943,
                busStops: ["Okpara Avenue", "Ogui Road"],
              },
            ],
          },
        ],
      },
      {
        name: "Akwa Ibom",
        lgas: [
          {
            name: "Uyo",
            areas: [
              {
                name: "Uyo Township",
                lat: 5.0433,
                lng: 7.912,
                busStops: ["Ibom Plaza", "Itam Junction", "Aka Road"],
              },
            ],
          },
        ],
      },
      {
        name: "Kaduna",
        lgas: [
          {
            name: "Kaduna North",
            areas: [
              {
                name: "Barnawa",
                lat: 10.5105,
                lng: 7.4165,
                busStops: ["Kawo Bridge", "Ahmadu Bello Way"],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: "GH",
    name: "Ghana",
    states: [
      {
        name: "Greater Accra",
        lgas: [
          {
            name: "Accra Metropolitan",
            areas: [
              {
                name: "Osu",
                lat: 5.5559,
                lng: -0.1801,
                busStops: ["Oxford Street", "Danquah Circle"],
              },
              {
                name: "East Legon",
                lat: 5.6378,
                lng: -0.1573,
                busStops: ["A&C Mall", "American House"],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: "KE",
    name: "Kenya",
    states: [
      {
        name: "Nairobi",
        lgas: [
          {
            name: "Westlands",
            areas: [
              {
                name: "Westlands",
                lat: -1.2667,
                lng: 36.8049,
                busStops: ["Sarit Centre", "ABC Place"],
              },
            ],
          },
          {
            name: "Kilimani",
            areas: [
              {
                name: "Kilimani",
                lat: -1.2906,
                lng: 36.7849,
                busStops: ["Yaya Centre", "Adams Arcade"],
              },
            ],
          },
        ],
      },
    ],
  },
];

COUNTRIES.forEach((country) => {
  country.states.forEach((state) => {
    state.lgas = state.lgas.filter((l) => Array.isArray(l.areas) && l.areas.length > 0);
  });
});

export type LocationFilter = {
  country: string;
  state: string;
  lga: string;
  area: string;
  busStop: string;
};

export const ANY = "any";

export function findCountry(code: string) {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}

export function findState(country: Country, name: string) {
  return country.states.find((s) => s.name === name);
}

export function findLga(state: State | undefined, name: string) {
  return state?.lgas.find((l) => l.name === name);
}

export function findArea(lga: Lga | undefined, name: string) {
  return lga?.areas.find((a) => a.name === name);
}

export function resolveFilterCenter(filter: LocationFilter, fallback: { lat: number; lng: number; label: string }) {
  const country = findCountry(filter.country);
  if (!country) return fallback;
  const state = filter.state !== ANY ? findState(country, filter.state) : undefined;
  const lga = filter.lga !== ANY ? findLga(state, filter.lga) : undefined;
  const area = filter.area !== ANY ? findArea(lga, filter.area) : undefined;
  if (area) return { lat: area.lat, lng: area.lng, label: area.name };
  return fallback;
}

export function locationFilterMatches(filter: LocationFilter, locationLabel: string) {
  const haystack = locationLabel.toLowerCase();
  const targets = [filter.busStop, filter.area, filter.lga, filter.state]
    .filter((value) => value && value !== ANY)
    .map((value) => value.toLowerCase());
  if (targets.length === 0) return true;
  return targets.some((needle) => haystack.includes(needle));
}

export const DEFAULT_LOCATION_FILTER: LocationFilter = {
  country: "NG",
  state: ANY,
  lga: ANY,
  area: ANY,
  busStop: ANY,
};
