export const config = {
  runtime: 'edge',
};

const PLANTNET_API_KEY = process.env.PLANTNET_API_KEY || process.env.VITE_PLANTNET_API_KEY || '2b10qSHoLPAnN9YdAbFC9k8X1O';

const BOTANICAL_SYNONYMS = {
  // Tulsi
  "ocimum tenuiflorum": "tulsi",
  "ocimum sanctum": "tulsi",
  "ocimum gratissimum": "tulsi",
  "ocimum basilicum": "tulsi",
  // Neem
  "azadirachta indica": "neem",
  "melia azadirachta": "neem",
  // Ashwagandha
  "withania somnifera": "ashwagandha",
  "physalis somnifera": "ashwagandha",
  // Brahmi
  "bacopa monnieri": "brahmi",
  "herpestis monnieria": "brahmi",
  "centella asiatica": "brahmi",
  // Turmeric
  "curcuma longa": "turmeric",
  "curcuma domestica": "turmeric",
  // Aloe Vera
  "aloe barbadensis": "aloe-vera",
  "aloe vera": "aloe-vera",
  "aloe officinalis": "aloe-vera",
  "aloe perfoliata": "aloe-vera",
  "aloe chinensis": "aloe-vera",
  // Giloy
  "tinospora cordifolia": "giloy",
  "menispermum cordifolium": "giloy",
  // Ginger
  "zingiber officinale": "ginger",
  // Amla
  "phyllanthus emblica": "amla",
  "emblica officinalis": "amla",
  // Fenugreek
  "trigonella foenum-graecum": "fenugreek",
  // Shatavari
  "asparagus racemosus": "shatavari",
  // Karela
  "momordica charantia": "karela"
};

const AYURVEDIC_SIGNATURES = [
  {
    slug: "tulsi",
    common_name: "Holy Basil",
    scientific_name: "Ocimum sanctum",
    ayurvedic_name: "Tulsi",
    traits: ["Opposite serrate leaves", "Pungent aromatic trichomes"],
    category: "Immunity"
  },
  {
    slug: "neem",
    common_name: "Neem",
    scientific_name: "Azadirachta indica",
    ayurvedic_name: "Nimba",
    traits: ["Alternate pinnately compound leaves", "Curved serrated leaflets"],
    category: "Skin Care"
  },
  {
    slug: "ashwagandha",
    common_name: "Ashwagandha",
    scientific_name: "Withania somnifera",
    ayurvedic_name: "Ashwagandha",
    traits: ["Elliptic-ovate dull green leaves", "Small greenish-yellow bell flowers"],
    category: "Adaptogens"
  },
  {
    slug: "brahmi",
    common_name: "Water Hyssop",
    scientific_name: "Bacopa monnieri",
    ayurvedic_name: "Brahmi",
    traits: ["Succulent oblong-spathulate leaves", "Opposite decussate arrangement"],
    category: "Stress Relief"
  },
  {
    slug: "turmeric",
    common_name: "Turmeric",
    scientific_name: "Curcuma longa",
    ayurvedic_name: "Haridra",
    traits: ["Large oblong-lanceolate leaves", "Fleshy orange-yellow rhizome"],
    category: "Heart Health"
  },
  {
    slug: "aloe-vera",
    common_name: "Aloe Vera",
    scientific_name: "Aloe barbadensis",
    ayurvedic_name: "Kumari",
    traits: ["Fleshy thick succulent rosette", "White serrated marginal teeth"],
    category: "Digestion"
  },
  {
    slug: "giloy",
    common_name: "Heart-Leaved Moonseed",
    scientific_name: "Tinospora cordifolia",
    ayurvedic_name: "Guduchi / Giloy",
    traits: ["Distinct cordate heart-shaped leaves", "Succulent climbing stem with warty lenticels"],
    category: "Immunity"
  },
  {
    slug: "ginger",
    common_name: "Ginger",
    scientific_name: "Zingiber officinale",
    ayurvedic_name: "Shunthi / Adrak",
    traits: ["Linear-lanceolate grass-like leaves", "Knobby aromatic fibrous rhizome"],
    category: "Digestion"
  },
  {
    slug: "amla",
    common_name: "Indian Gooseberry",
    scientific_name: "Phyllanthus emblica",
    ayurvedic_name: "Amalaki",
    traits: ["Feathery branchlets with linear-oblong leaflets", "Globose ribbed sour fruits"],
    category: "Immunity"
  },
  {
    slug: "fenugreek",
    common_name: "Fenugreek",
    scientific_name: "Trigonella foenum-graecum",
    ayurvedic_name: "Methika",
    traits: ["Trifoliate ovate leaflets", "Small yellowish-white pea flowers"],
    category: "Diabetes"
  },
  {
    slug: "shatavari",
    common_name: "Wild Asparagus",
    scientific_name: "Asparagus racemosus",
    ayurvedic_name: "Shatavari",
    traits: ["Climbing vine with pine-like needle cladodes", "Tuberous cylindrical roots"],
    category: "Women Health"
  },
  {
    slug: "karela",
    common_name: "Bitter Melon",
    scientific_name: "Momordica charantia",
    ayurvedic_name: "Karavellaka",
    traits: ["Deeply lobed palmately compound leaves", "Warty elongated bitter fruit"],
    category: "Diabetes"
  }
];

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return new Response(JSON.stringify({ error: 'No image file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const hint = (formData.get('hint') || '').toLowerCase();
    const organParam = formData.get('organ') || 'auto';

    // 1. If sample preset hint matches
    if (hint) {
      const sigMatch = AYURVEDIC_SIGNATURES.find(s => s.slug === hint || s.common_name.toLowerCase().includes(hint));
      if (sigMatch) {
        return new Response(JSON.stringify({
          status: 'success',
          source: 'sample_preset',
          predicted_name: sigMatch.common_name,
          scientific_name: sigMatch.scientific_name,
          ayurvedic_name: sigMatch.ayurvedic_name,
          slug: sigMatch.slug,
          category: sigMatch.category,
          confidence_score: 95.5,
          botanical_traits: sigMatch.traits,
          matched_plant_slug: sigMatch.slug,
          disclaimer: 'Botanical sample match from classical Ayurvedic corpus.'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    const organsToTry = organParam === 'auto' ? ['auto', 'leaf', 'flower'] : [organParam];
    let results = [];

    for (const organ of organsToTry) {
      try {
        const outForm = new FormData();
        outForm.append('images', imageFile, 'plant.jpg');
        outForm.append('organs', organ);

        const pnetRes = await fetch(
          `https://my-api.plantnet.org/v2/identify/all?api-key=${PLANTNET_API_KEY}`,
          { method: 'POST', body: outForm }
        );

        if (pnetRes.ok) {
          const data = await pnetRes.json();
          if (data.results && data.results.length > 0) {
            results = data.results;
            break;
          }
        }
      } catch (e) {
        // Continue to next organ attempt
      }
    }

    if (results.length === 0) {
      return new Response(
        JSON.stringify({
          status: 'error',
          error: 'No plant detected',
          message: 'We could not detect a valid plant, leaf, or flower in this image. Please upload a clear photo of a real plant specimen.',
          is_not_plant: true
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const top = results[0];
    const score = top.score || 0;

    if (score < 0.06) {
      return new Response(
        JSON.stringify({
          status: 'error',
          error: 'No confident plant match',
          message: 'The uploaded image does not appear to contain recognizable botanical features. Please upload a closer, well-lit photo of a leaf or flower.',
          is_not_plant: true
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const topSpecies = top.species || {};
    const confidence = Math.round(score * 1000) / 10;

    const sciName =
      topSpecies.scientificNameWithoutAuthor ||
      topSpecies.scientificName ||
      'Unknown Plant';
    const commonNames = topSpecies.commonNames || [];
    const genus = topSpecies.genus?.scientificNameWithoutAuthor || '';
    const family = topSpecies.family?.scientificNameWithoutAuthor || '';
    const sciLower = sciName.toLowerCase().trim();

    let matchedSlug = BOTANICAL_SYNONYMS[sciLower];
    let matchedSignature = null;

    if (!matchedSlug && sciLower.startsWith('aloe')) matchedSlug = 'aloe-vera';
    if (!matchedSlug && sciLower.startsWith('ocimum')) matchedSlug = 'tulsi';

    if (!matchedSlug) {
      for (const sig of AYURVEDIC_SIGNATURES) {
        if (
          sciLower.includes(sig.scientific_name.toLowerCase()) ||
          sig.scientific_name.toLowerCase().includes(sciLower)
        ) {
          matchedSlug = sig.slug;
          matchedSignature = sig;
          break;
        }
      }
    }

    if (!matchedSlug && commonNames.length > 0) {
      for (const c of commonNames) {
        const cLower = c.toLowerCase();
        for (const sig of AYURVEDIC_SIGNATURES) {
          if (
            cLower.includes(sig.common_name.toLowerCase()) ||
            sig.common_name.toLowerCase().includes(cLower) ||
            cLower.includes(sig.ayurvedic_name.toLowerCase()) ||
            sig.ayurvedic_name.toLowerCase().includes(cLower) ||
            cLower.includes(sig.slug)
          ) {
            matchedSlug = sig.slug;
            matchedSignature = sig;
            break;
          }
        }
        if (matchedSlug) break;
      }
    }

    if (matchedSlug && !matchedSignature) {
      matchedSignature =
        AYURVEDIC_SIGNATURES.find((s) => s.slug === matchedSlug) || null;
    }

    const traits = [];
    if (family) traits.push(`Family: ${family}`);
    if (genus) traits.push(`Genus: ${genus}`);
    if (matchedSignature?.traits) {
      traits.push(...matchedSignature.traits.slice(0, 2));
    } else if (commonNames.length > 0) {
      traits.push(`Common: ${commonNames.slice(0, 2).join(', ')}`);
    }

    let secondary = null;
    if (results.length > 1) {
      const sec = results[1];
      const secSpecies = sec.species || {};
      const secCommon = secSpecies.commonNames || [];
      secondary = {
        common_name:
          secCommon[0] ||
          secSpecies.scientificNameWithoutAuthor ||
          'Alternative match',
        scientific_name: secSpecies.scientificNameWithoutAuthor || '',
        confidence_score: Math.max(1, Math.round((sec.score || 0) * 1000) / 10),
      };
    }

    const payload = {
      status: 'success',
      source: 'plantnet_api',
      predicted_name: matchedSignature
        ? matchedSignature.common_name
        : commonNames[0] || sciName,
      scientific_name: sciName,
      ayurvedic_name: matchedSignature ? matchedSignature.ayurvedic_name : null,
      slug: matchedSlug || sciName.toLowerCase().replace(/\s+/g, '-'),
      category: matchedSignature ? matchedSignature.category : 'Medicinal Flora',
      confidence_score: confidence,
      botanical_traits: traits,
      matched_plant_slug: matchedSlug,
      secondary_prediction: secondary,
      disclaimer:
        'Identified using Pl@ntNet botanical vision. Verify identity before medicinal or therapeutic preparation.',
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Serverless identification error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
