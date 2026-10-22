// Educational content for the 1919-1923 peace settlements.
// Every question points at a region id from geo.js and carries the textbook "card".

export const MANDATE_CLASSES = {
  A: {
    label: 'Class A mandate',
    text: 'Former Ottoman lands judged "nearly ready" for independence; a Mandatory power gave advice and help until they could stand alone.',
  },
  B: {
    label: 'Class B mandate',
    text: 'Former German colonies in central Africa; the Mandatory ran the territory under conditions (no slavery, no military bases, equal trade) and reported to the League.',
  },
  C: {
    label: 'Class C mandate',
    text: 'Sparsely populated or remote territories (South West Africa, Pacific islands) governed as an integral part of the Mandatory power\'s own territory.',
  },
};

const q = (region, theatre, view, clue, card) => ({ region, theatre, view, clue, card });

// ------------------------------------------------------------------ VERSAILLES
const versailles = {
  id: 'versailles',
  name: 'Treaty of Versailles',
  short: 'Versailles',
  date: '28 June 1919',
  defeated: 'Germany',
  accent: '#ef4444',
  blurb:
    'Signed in the Hall of Mirrors, the treaty with Germany redrew its borders, stripped it of every overseas colony and imposed heavy military and financial penalties. Germans called it a "Diktat" because they were not allowed to negotiate.',
  terms: [
    ['Army', 'Limited to 100,000 volunteers; conscription banned.'],
    ['Weapons', 'No tanks, no military aircraft, no submarines; navy capped at 6 battleships.'],
    ['Rhineland', 'Left of the Rhine and a 50 km strip east of it demilitarised; Allied occupation for up to 15 years.'],
    ['Anschluss', 'Union (Anschluss) with Austria forbidden.'],
    ['War Guilt', 'Article 231, the "War Guilt Clause", made Germany accept responsibility for the war.'],
    ['Reparations', 'Germany to pay for war damage; the total was fixed in 1921 at 132 billion gold marks.'],
    ['Colonies', 'All colonies taken and run as League of Nations mandates by the Allies.'],
  ],
  questions: [
    q('alsace_lorraine', 'europe', 'europe', 'A borderland on Germany\'s western edge, annexed in 1871.', {
      lostBy: 'Germany', gainer: 'France', status: 'Returned to France',
      summary: 'Alsace and Lorraine had been taken by Germany after the Franco-Prussian War of 1870-71. Their return to France was a central French war aim and was one of the first territorial clauses of the treaty.',
      points: ['Annexed by Germany in 1871', 'Returned to France in 1919', 'Rich in iron ore and heavy industry'],
    }),
    q('polish_corridor', 'europe', 'europe', 'A strip of land giving Poland a route to the Baltic Sea.', {
      lostBy: 'Germany', gainer: 'Poland', status: 'Created for Poland',
      summary: 'Wilson\'s Fourteen Points promised Poland "free and secure access to the sea". The Polish Corridor gave it that, but it split East Prussia from the rest of Germany. Danzig, at its mouth, became a Free City under League protection.',
      points: ['Cut Germany in two (East Prussia separated)', 'Danzig made a Free City', 'A lasting German grievance'],
    }),
    q('saar', 'europe', 'europe', 'A small coalfield region between France and the Rhineland.', {
      lostBy: 'Germany', gainer: 'League of Nations', status: 'Under League of Nations administration',
      summary: 'France wanted the Saar\'s coal to compensate for mines destroyed by Germany. The region was placed under League of Nations control for fifteen years, with France owning the mines; a plebiscite in 1935 then decided its future.',
      points: ['League of Nations administration for 15 years', 'French ownership of the coal mines', 'Plebiscite in 1935 (91% voted to rejoin Germany)'],
    }),
    q('togoland', 'colonies', 'africa', 'A narrow West African colony on the Gulf of Guinea.', {
      lostBy: 'Germany', gainer: 'Britain and France', status: 'Class B mandate', mandate: 'B',
      summary: 'Togoland was divided between Britain and France, each holding its share as a League of Nations mandate. The British part was later joined to the Gold Coast (Ghana); the French part became modern Togo.',
      points: ['Divided between Britain and France', 'Class B mandate', 'Principle: mandatory power governs for the benefit of the inhabitants'],
    }),
    q('kamerun', 'colonies', 'africa', 'A West African colony at the "armpit" of the Gulf of Guinea.', {
      lostBy: 'Germany', gainer: 'Britain and France', status: 'Class B mandate', mandate: 'B',
      summary: 'Kamerun was split into British and French Cameroons. France received the much larger eastern part and Britain two thin strips alongside Nigeria. Both were administered as Class B mandates.',
      points: ['Divided between Britain and France', 'France took about four fifths', 'Class B mandate'],
    }),
    q('tanganyika', 'colonies', 'africa', 'Germany\'s largest African colony, home of Mount Kilimanjaro.', {
      lostBy: 'Germany', gainer: 'Britain', status: 'Class B mandate', mandate: 'B',
      summary: 'Most of German East Africa became Tanganyika under British mandate. The Cape-to-Cairo ambition of linking British territories by rail was now possible. Small parts went to Portugal (Kionga Triangle).',
      points: ['Tanganyika to Britain', 'Class B mandate', 'Became independent as Tanzania (with Zanzibar) in 1964'],
    }),
    q('ruanda_urundi', 'colonies', 'africa', 'A small, densely populated highland territory west of Lake Victoria.', {
      lostBy: 'Germany', gainer: 'Belgium', status: 'Class B mandate', mandate: 'B',
      summary: 'The north-western corner of German East Africa, Ruanda-Urundi, was mandated to Belgium, which already ruled the neighbouring Congo. It later became Rwanda and Burundi.',
      points: ['Ruanda-Urundi to Belgium', 'Class B mandate', 'Now Rwanda and Burundi'],
    }),
    q('sw_africa', 'colonies', 'africa', 'A desert colony on Africa\'s south-west coast, north of the Cape.', {
      lostBy: 'Germany', gainer: 'South Africa', status: 'Class C mandate', mandate: 'C',
      summary: 'German South West Africa was mandated to the Union of South Africa as a Class C mandate, meaning it could be governed as part of the mandatory\'s own territory. South Africa held on to it until Namibia became independent in 1990.',
      points: ['Mandated to South Africa', 'Class C mandate', 'Namibia independent in 1990'],
    }),
    q('kiautschou', 'colonies', 'asia_pacific', 'A German leased port and railway zone on the Yellow Sea coast of China.', {
      lostBy: 'Germany', gainer: 'Japan', status: 'Rights assigned to Japan',
      summary: 'Germany\'s concession at Kiautschou (Qingdao) and its economic rights in Shandong were handed to Japan, not back to China. Chinese anger at this decision led to the May Fourth Movement; China refused to sign the treaty, and Japan returned Shandong to China in 1922.',
      points: ['Not a mandate: rights assigned to Japan', 'China refused to sign', 'May Fourth Movement, 1919', 'Returned to China in 1922'],
    }),
    q('german_new_guinea', 'colonies', 'asia_pacific', 'The north-east of New Guinea and the Bismarck Archipelago.', {
      lostBy: 'Germany', gainer: 'Australia', status: 'Class C mandate', mandate: 'C',
      summary: 'Australian forces had seized German New Guinea in 1914. It became the Mandated Territory of New Guinea under Australia, a Class C mandate.',
      points: ['Mandated to Australia', 'Class C mandate', 'Captured in 1914'],
    }),
    q('solomons', 'colonies', 'asia_pacific', 'The German-held northern Solomon Islands, east of New Guinea.', {
      lostBy: 'Germany', gainer: 'Australia', status: 'Class C mandate', mandate: 'C',
      summary: 'Bougainville and Buka, Germany\'s share of the Solomon Islands, were administered by Australia together with New Guinea as a Class C mandate.',
      points: ['Mandated to Australia', 'Class C mandate', 'Administered with New Guinea'],
    }),
    q('samoa', 'colonies', 'asia_pacific', 'Two Pacific islands far east of the map, north-east of Fiji.', {
      lostBy: 'Germany', gainer: 'New Zealand', status: 'Class C mandate', mandate: 'C',
      summary: 'New Zealand occupied German Samoa in August 1914 without a fight. It was awarded to New Zealand as a Class C mandate and became independent in 1962 as Western Samoa.',
      points: ['Mandated to New Zealand', 'Class C mandate', 'Independent 1962'],
    }),
    q('nauru', 'colonies', 'asia_pacific', 'A tiny island on the equator, rich in phosphate.', {
      lostBy: 'Germany', gainer: 'Australia, New Zealand and Britain', status: 'Class C mandate', mandate: 'C',
      summary: 'Nauru\'s phosphate deposits were valuable fertiliser. The island was mandated jointly to Britain, Australia and New Zealand, with Australia doing most of the administration.',
      points: ['Joint mandate: Australia, New Zealand, Britain', 'Class C mandate', 'Valuable phosphate'],
    }),
    q('south_seas', 'colonies', 'asia_pacific', 'Scattered Pacific island chains north of the equator: Marianas, Carolines, Marshalls.', {
      lostBy: 'Germany', gainer: 'Japan', status: 'Class C mandate', mandate: 'C',
      summary: 'Japan had occupied Germany\'s North Pacific islands in 1914. They became the South Seas Mandate, a Class C mandate that put Japan across the sea routes between Hawaii and the Philippines. Guam stayed American.',
      points: ['Marianas, Carolines and Marshall Islands', 'Mandated to Japan', 'Class C mandate'],
    }),
  ],
};

// ---------------------------------------------------------------- SAINT GERMAIN
const saintGermain = {
  id: 'saint-germain',
  name: 'Treaty of Saint-Germain',
  short: 'Saint-Germain',
  date: '10 September 1919',
  defeated: 'Austria',
  accent: '#f59e0b',
  blurb:
    'The Austro-Hungarian empire had already broken apart as its nationalities declared independence. The treaty with Austria recognised the new states and shrank German-speaking Austria to a small republic.',
  terms: [
    ['Break-up', 'The Austro-Hungarian empire was dissolved; Austria became a small republic.'],
    ['Army', 'Limited to 30,000 volunteers.'],
    ['Anschluss', 'Union with Germany forbidden, and the state had to call itself "Austria", not "German-Austria".'],
    ['Reparations', 'Austria had to pay reparations to the Allies.'],
    ['Minorities', 'Many Germans (about three million Sudeten Germans and South Tyroleans) ended up in other countries.'],
  ],
  questions: [
    q('bohemia_moravia', 'europe', 'europe', 'Industrial lands that formed the heart of a new Slav republic.', {
      lostBy: 'Austria', gainer: 'Czechoslovakia', status: 'To Czechoslovakia',
      summary: 'Bohemia and Moravia were the industrial heartland of the old empire. They formed the core of the new state of Czechoslovakia, which included about three million German speakers in the Sudetenland.',
      points: ['To Czechoslovakia', 'Included the German-speaking Sudetenland', 'Most of the old empire\'s industry'],
    }),
    q('dalmatia', 'europe', 'europe', 'A long Adriatic coastline on the east side of the sea.', {
      lostBy: 'Austria', gainer: 'Yugoslavia', status: 'To Yugoslavia',
      summary: 'Dalmatia gave the new Kingdom of Serbs, Croats and Slovenes (Yugoslavia) its Adriatic coastline. Italy had been promised parts of it in the secret Treaty of London (1915) and was left unsatisfied.',
      points: ['To the Kingdom of Serbs, Croats and Slovenes', 'Italy resented its limited gains'],
    }),
    q('bosnia', 'europe', 'europe', 'The region where Archduke Franz Ferdinand was assassinated.', {
      lostBy: 'Austria', gainer: 'Yugoslavia', status: 'To Yugoslavia',
      summary: 'Austria-Hungary had annexed Bosnia and Herzegovina in 1908. Saint-Germain gave it up to Yugoslavia. Sarajevo, where the 1914 assassination sparked the war, was now a Yugoslav city.',
      points: ['Annexed by Austria in 1908', 'To Yugoslavia in 1919', 'Site of the assassination in Sarajevo'],
    }),
    q('bukovina', 'europe', 'europe', 'A forested Carpathian province in the far east of the old empire.', {
      lostBy: 'Austria', gainer: 'Romania', status: 'To Romania',
      summary: 'Bukovina, with a mixed Romanian, Ukrainian and German population, was transferred to Romania, which had joined the Allies in 1916 and was rewarded with large gains.',
      points: ['To Romania', 'Mixed population', 'Part of "Greater Romania"'],
    }),
    q('galicia', 'europe', 'europe', 'A large province north of the Carpathians, now part of a revived country.', {
      lostBy: 'Austria', gainer: 'Poland', status: 'To Poland',
      summary: 'Galicia went to the newly re-created Poland. Eastern Galicia, with many Ukrainians, was fought over until the Allies confirmed Polish control in 1923.',
      points: ['To Poland', 'Poland restored as a state after 123 years', 'Eastern Galicia confirmed Polish in 1923'],
    }),
    q('south_tyrol', 'europe', 'europe', 'Alpine valleys south of the Brenner Pass.', {
      lostBy: 'Austria', gainer: 'Italy', status: 'To Italy',
      summary: 'Italy received Trentino and South Tyrol up to the Brenner Pass, including some 250,000 German speakers. This was Italy\'s reward for joining the Allies in 1915.',
      points: ['Trentino and South Tyrol to Italy', 'Border at the Brenner Pass', 'German-speaking minority'],
    }),
    q('istria_trieste', 'europe', 'europe', 'The port of Trieste and the peninsula beside it.', {
      lostBy: 'Austria', gainer: 'Italy', status: 'To Italy',
      summary: 'Istria and Trieste, the old empire\'s main seaport, were given to Italy. Italian nationalists still felt that Italy had been cheated of Dalmatia and Fiume - the "mutilated victory".',
      points: ['Trieste and Istria to Italy', 'Austria left landlocked', '"Mutilated victory" grievance in Italy'],
    }),
  ],
};

// ---------------------------------------------------------------------- NEUILLY
const neuilly = {
  id: 'neuilly',
  name: 'Treaty of Neuilly',
  short: 'Neuilly',
  date: '27 November 1919',
  defeated: 'Bulgaria',
  accent: '#22c55e',
  blurb:
    'Bulgaria had joined the Central Powers in 1915 hoping to win Macedonia. It lost small but important border districts and its access to the Aegean Sea.',
  terms: [
    ['Army', 'Limited to 20,000 volunteers.'],
    ['Reparations', 'More than $400 million (2.25 billion gold francs) payable over 37 years.'],
    ['Territory', 'Land lost to Greece, Yugoslavia and Romania, cutting Bulgaria off from the Aegean.'],
  ],
  questions: [
    q('western_thrace', 'europe', 'europe', 'The Aegean coastline of Bulgaria.', {
      lostBy: 'Bulgaria', gainer: 'Greece', status: 'To Greece',
      summary: 'Western Thrace was taken from Bulgaria, which lost its Aegean coast. The Allies held it briefly before handing it to Greece in 1920 (San Remo).',
      points: ['To Greece', 'Bulgaria lost its outlet to the Aegean', 'Allies handed it to Greece in 1920'],
    }),
    q('strumica_tsaribrod', 'europe', 'europe', 'Small western border districts that went to Bulgaria\'s western neighbour.', {
      lostBy: 'Bulgaria', gainer: 'Yugoslavia', status: 'To Yugoslavia',
      summary: 'Strumica and the Tsaribrod area were ceded to the Kingdom of Serbs, Croats and Slovenes for strategic reasons - they gave Yugoslavia stronger border defences.',
      points: ['To Yugoslavia', 'Border adjustment for strategic reasons'],
    }),
    q('southern_dobruja', 'europe', 'europe', 'The coastal plain south of the Danube delta on the Black Sea.', {
      lostBy: 'Bulgaria', gainer: 'Romania', status: 'Confirmed as Romanian',
      summary: 'Southern Dobruja had first been taken by Romania in 1913. Neuilly confirmed Romanian possession (Bulgaria regained it in 1940). Romania was one of the war\'s big territorial winners.',
      points: ['Taken by Romania in 1913', 'Confirmed by Neuilly', 'Returned to Bulgaria in 1940'],
    }),
  ],
};

// ---------------------------------------------------------------------- TRIANON
const trianon = {
  id: 'trianon',
  name: 'Treaty of Trianon',
  short: 'Trianon',
  date: '4 June 1920',
  defeated: 'Hungary',
  accent: '#a855f7',
  blurb:
    'Hungary lost about two thirds of its pre-war territory and roughly three fifths of its population. Millions of Magyars suddenly lived outside Hungary\'s borders, a grievance that shaped Hungarian politics for decades.',
  terms: [
    ['Territory', 'About 70% of the Kingdom of Hungary\'s land was lost.'],
    ['Army', 'Limited to 35,000 volunteers.'],
    ['Reparations', 'Hungary to pay reparations to the Allies.'],
    ['Minorities', 'Over three million Magyars were left in neighbouring states.'],
  ],
  questions: [
    q('slovakia', 'europe', 'europe', 'The northern highlands of old Hungary, home to Slovaks.', {
      lostBy: 'Hungary', gainer: 'Czechoslovakia', status: 'To Czechoslovakia',
      summary: 'Slovakia joined Bohemia and Moravia in the new state of Czechoslovakia. A large Magyar minority remained on the Slovak side of the border.',
      points: ['To Czechoslovakia', 'Slovaks and Czechs united in one state'],
    }),
    q('ruthenia', 'europe', 'europe', 'A mountainous easternmost tail of Czechoslovakia.', {
      lostBy: 'Hungary', gainer: 'Czechoslovakia', status: 'To Czechoslovakia',
      summary: 'Carpathian Ruthenia gave Czechoslovakia a common border with Romania, its ally in the "Little Entente".',
      points: ['To Czechoslovakia', 'Gave a link to Romania'],
    }),
    q('transylvania', 'europe', 'europe', 'A large plateau ringed by the Carpathian Mountains.', {
      lostBy: 'Hungary', gainer: 'Romania', status: 'To Romania',
      summary: 'Transylvania, with a large Romanian majority but a significant Magyar minority, went to Romania. It remains the most emotional territorial loss in Hungarian memory.',
      points: ['To Romania', 'Large Magyar minority remained', 'Core of "Greater Romania"'],
    }),
    q('croatia', 'europe', 'europe', 'Territory between the Drava river and the Adriatic, south of Hungary.', {
      lostBy: 'Hungary', gainer: 'Yugoslavia', status: 'To Yugoslavia',
      summary: 'Croatia-Slavonia, which had been in the Hungarian half of the Dual Monarchy, joined the Kingdom of Serbs, Croats and Slovenes.',
      points: ['To Yugoslavia', 'Previously under the Hungarian crown'],
    }),
    q('slovenia', 'europe', 'europe', 'Alpine land in the north-west of the new Balkan kingdom.', {
      lostBy: 'Hungary', gainer: 'Yugoslavia', status: 'To Yugoslavia',
      summary: 'Slovenia (the Prekmurje district came from Hungary) became part of the Kingdom of Serbs, Croats and Slovenes, renamed Yugoslavia in 1929.',
      points: ['To Yugoslavia', 'Kingdom of Serbs, Croats and Slovenes'],
    }),
  ],
};

// ------------------------------------------------------------------------ SEVRES
const sevres = {
  id: 'sevres',
  name: 'Treaty of Sèvres',
  short: 'Sèvres',
  date: '10 August 1920',
  defeated: 'Ottoman Empire',
  accent: '#06b6d4',
  blurb:
    'The Sultan\'s government signed away most of the empire. Greece, Italy, France and Britain claimed zones in Anatolia, while the Arab provinces were divided into League mandates. The treaty was never ratified because Mustafa Kemal and the Turkish National Movement rejected it.',
  terms: [
    ['Europe', 'Eastern Thrace and the Smyrna zone to Greece; Dodecanese and Adalia zone to Italy.'],
    ['Straits', 'Dardanelles and Bosphorus permanently opened to ships of all nations under an international commission.'],
    ['Arab lands', 'Syria and Lebanon to France; Palestine, Transjordan and Mesopotamia (Iraq) to Britain; Hejaz and Yemen no longer Ottoman.'],
    ['Army', 'Reduced to 50,000 men; Allied financial and military control.'],
    ['Resistance', 'Mustafa Kemal rallied Turkish nationalists in Ankara to overturn Sèvres.'],
  ],
  questions: [
    q('eastern_thrace', 'europe', 'middle_east', 'The Ottoman Empire\'s last foothold in Europe, next to Greece and Bulgaria.', {
      lostBy: 'Ottoman Empire', gainer: 'Greece', status: 'To Greece',
      summary: 'Sèvres gave Eastern Thrace up to the Çatalca lines to Greece, leaving the Ottomans just a small area around Constantinople.',
      points: ['To Greece', 'Included Adrianople (Edirne)', 'Later reversed at Lausanne'],
    }),
    q('smyrna', 'europe', 'middle_east', 'A rich Aegean port region on Anatolia\'s west coast with many Greek residents.', {
      lostBy: 'Ottoman Empire', gainer: 'Greece', status: 'Greek administration',
      summary: 'Greece occupied Smyrna (Izmir) in May 1919. Sèvres confirmed Greek administration, with a plebiscite promised after five years. The occupation helped trigger the Turkish War of Independence.',
      points: ['Greek zone around Smyrna (Izmir)', 'Plebiscite promised after five years', 'Sparked Turkish resistance'],
    }),
    q('dodecanese_adalia', 'europe', 'middle_east', 'Aegean islands and a southern Turkish coastal region claimed by Italy.', {
      lostBy: 'Ottoman Empire', gainer: 'Italy', status: 'To Italy',
      summary: 'Italy received the Dodecanese islands (including Rhodes) and a zone of influence around Adalia (Antalya), as promised in wartime secret treaties.',
      points: ['Dodecanese islands to Italy', 'Adalia zone of Italian influence', 'Secret wartime promises'],
    }),
    q('straits', 'europe', 'middle_east', 'The narrow waterway linking the Black Sea to the Mediterranean.', {
      lostBy: 'Ottoman Empire', gainer: 'International commission', status: 'Permanently opened to foreign shipping',
      summary: 'The Dardanelles and the Bosphorus were to be permanently opened to ships of all nations in war and peace, run by an international Straits Commission. For the Ottomans this meant loss of control of Constantinople\'s lifeline.',
      points: ['Permanently opened to foreign shipping', 'International Straits Commission', 'Demilitarised zone'],
    }),
    q('syria_lebanon', 'colonies', 'middle_east', 'Eastern Mediterranean lands north of Palestine, including Damascus and Beirut.', {
      lostBy: 'Ottoman Empire', gainer: 'France', status: 'Class A mandate', mandate: 'A',
      summary: 'Syria and Lebanon were mandated to France, which in 1920 ejected Faisal\'s Arab government from Damascus. Lebanon was later enlarged as "Greater Lebanon".',
      points: ['Mandated to France', 'Class A mandate', 'Sykes-Picot agreement (1916)'],
    }),
    q('palestine', 'colonies', 'middle_east', 'Land on the east Mediterranean coast between Egypt and Syria.', {
      lostBy: 'Ottoman Empire', gainer: 'Britain', status: 'Class A mandate', mandate: 'A',
      summary: 'Palestine was mandated to Britain, which also had to put the 1917 Balfour Declaration into effect (a "national home" for the Jewish people without harming existing communities).',
      points: ['Mandated to Britain', 'Class A mandate', 'Balfour Declaration, 1917'],
    }),
    q('transjordan', 'colonies', 'middle_east', 'The desert east of the River Jordan.', {
      lostBy: 'Ottoman Empire', gainer: 'Britain', status: 'Class A mandate', mandate: 'A',
      summary: 'Transjordan was part of the British Mandate for Palestine, but Britain ruled it separately through Emir Abdullah from 1921.',
      points: ['Mandated to Britain', 'Class A mandate', 'Emir Abdullah from 1921'],
    }),
    q('iraq', 'colonies', 'middle_east', 'The land of the Tigris and Euphrates rivers.', {
      lostBy: 'Ottoman Empire', gainer: 'Britain', status: 'Class A mandate', mandate: 'A',
      summary: 'Mesopotamia (Iraq) was mandated to Britain, which had occupied it during the war. Oil resources made it especially valuable. Britain installed Faisal as king in 1921.',
      points: ['Mandated to Britain', 'Class A mandate', 'Oil resources', 'Independent 1932'],
    }),
    q('hejaz', 'colonies', 'middle_east', 'The Red Sea coast of Arabia, home to Mecca and Medina.', {
      lostBy: 'Ottoman Empire', gainer: 'Independent kingdom', status: 'Ottoman control ended',
      summary: 'The Ottomans gave up control of the Hejaz, which became an independent kingdom under Sharif Hussein of Mecca, leader of the 1916 Arab Revolt. It was conquered by Ibn Saud in 1925.',
      points: ['No longer Ottoman', 'Kingdom of Hussein', 'Arab Revolt, 1916'],
    }),
    q('yemen', 'colonies', 'middle_east', 'The south-western corner of the Arabian Peninsula.', {
      lostBy: 'Ottoman Empire', gainer: 'Independent', status: 'Ottoman control ended',
      summary: 'Ottoman control of Yemen collapsed after 1918 and Imam Yahya ruled an independent state.',
      points: ['No longer Ottoman', 'Independent under Imam Yahya'],
    }),
  ],
};

// ---------------------------------------------------------------------- LAUSANNE
const lausanne = {
  id: 'lausanne',
  name: 'Treaty of Lausanne',
  short: 'Lausanne',
  date: '24 July 1923',
  defeated: 'Turkey (recognised victor)',
  accent: '#3b82f6',
  isLausanne: true,
  blurb:
    'Mustafa Kemal\'s armies drove the Greeks from Anatolia in 1922. Sèvres was torn up, and the Allies negotiated a new treaty with the new Turkish government at Lausanne - the only 1919-20 treaty that the defeated side successfully renegotiated.',
  terms: [
    ['Borders', 'Recognised the independent Republic of Turkey, with Anatolia intact.'],
    ['Thrace & Smyrna', 'Eastern Thrace (including Edirne) and Smyrna (Izmir) returned to Turkey.'],
    ['Occupation', 'Foreign military occupation ended.'],
    ['Economy', 'Capitulations and foreign financial controls abolished; no war reparations.'],
    ['Straits', 'Turkish sovereignty restored but the Straits demilitarised and open under an international commission (until the Montreux Convention, 1936).'],
    ['Population exchange', 'Compulsory exchange of Greek Orthodox and Muslim populations (about 1.6 million people).'],
    ['Left unresolved', 'Mosul was referred to the League of Nations (given to Iraq in 1926). The Arab mandates were not returned.'],
  ],
  questions: [
    q('turkey_1923', 'europe', 'middle_east', 'The heartland of a new nation, ruled from Ankara.', {
      lostBy: '—', gainer: 'Turkey', status: 'Anatolia intact',
      summary: 'Lausanne recognised the Republic of Turkey (proclaimed October 1923) within its modern borders, rejecting the Sèvres plans for Greek, Italian, French, Armenian and Kurdish zones in Anatolia.',
      points: ['Republic of Turkey recognised', 'Anatolia intact', 'No partition of Anatolia'],
    }),
    q('smyrna', 'europe', 'middle_east', 'The Aegean city burned in September 1922.', {
      lostBy: 'Greece', gainer: 'Turkey', status: 'Regained by Turkey',
      summary: 'After the Turkish victory in 1922 the Greek army left Smyrna. Lausanne confirmed that Izmir was Turkish, and a compulsory population exchange followed.',
      points: ['Izmir regained', 'Greek army expelled in 1922', 'Greek-Turkish population exchange'],
    }),
    q('eastern_thrace', 'europe', 'middle_east', 'The European part of Turkey, including the city of Edirne.', {
      lostBy: 'Greece', gainer: 'Turkey', status: 'Regained by Turkey',
      summary: 'Eastern Thrace up to the Maritsa river, including Edirne (Adrianople), was returned to Turkey. This gave Turkey a modest foothold in Europe again.',
      points: ['Eastern Thrace returned', 'Included Edirne', 'Border on the Maritsa river'],
    }),
    q('straits', 'europe', 'middle_east', 'The waterway that Sèvres opened to all nations.', {
      lostBy: 'International commission', gainer: 'Turkey', status: 'Turkish sovereignty, demilitarised',
      summary: 'Turkey regained sovereignty over the Straits, but they stayed demilitarised and open to merchant ships and warships under an international commission. Turkey won the right to remilitarise them at Montreux in 1936.',
      points: ['Turkish jurisdiction restored', 'Demilitarised until 1936', 'Montreux Convention, 1936'],
    }),
  ],
};

export const TREATIES = [versailles, saintGermain, neuilly, trianon, sevres, lausanne];
export const TREATY_BY_ID = Object.fromEntries(TREATIES.map((t) => [t.id, t]));

/**
 * Lausanne comparison table: Sèvres (1920) versus Lausanne (1923).
 * `region` links a row to a map region so it can be highlighted.
 */
export const COMPARISON = [
  { region: 'turkey_1923', topic: 'Anatolian heartland', sevres: 'Reduced to a rump state, with zones for Greece, Italy, France plus Armenia and Kurdistan.', lausanne: 'Anatolia intact under the Republic of Turkey.', outcome: 'gain' },
  { region: 'smyrna', topic: 'Smyrna (Izmir)', sevres: 'Greek administration; plebiscite after five years.', lausanne: 'Returned to Turkey.', outcome: 'gain' },
  { region: 'eastern_thrace', topic: 'Eastern Thrace', sevres: 'Ceded to Greece, up to the Çatalca lines.', lausanne: 'Returned to Turkey, including Edirne.', outcome: 'gain' },
  { region: 'straits', topic: 'The Straits', sevres: 'Permanently opened; international commission in control.', lausanne: 'Turkish jurisdiction; demilitarised under a commission (to 1936).', outcome: 'gain' },
  { region: 'dodecanese_adalia', topic: 'Adalia & the islands', sevres: 'Italian zone of influence at Adalia; Dodecanese to Italy.', lausanne: 'Adalia region stays Turkish; Dodecanese remain Italian.', outcome: 'mixed' },
  { region: null, topic: 'Foreign occupation', sevres: 'Allied troops control Constantinople and the Straits.', lausanne: 'All foreign forces withdraw.', outcome: 'gain' },
  { region: null, topic: 'Economy', sevres: 'Allied financial control; capitulations for foreigners.', lausanne: 'Foreign economic controls abolished.', outcome: 'gain' },
  { region: null, topic: 'Reparations', sevres: 'Heavy obligations to the Allies.', lausanne: 'No military reparations.', outcome: 'gain' },
  { region: 'syria_lebanon', topic: 'Arab provinces', sevres: 'Lost to French and British mandates.', lausanne: 'Not recovered (Mosul left to the League).', outcome: 'loss' },
];

export const COMPARISON_REGION_STYLE = {
  // Colours used for the Sèvres "partition" view of the comparison slider
  eastern_thrace: '#3b82f6',
  smyrna: '#3b82f6',
  dodecanese_adalia: '#22c55e',
  straits: '#a855f7',
  syria_lebanon: '#f59e0b',
  palestine: '#f59e0b',
  transjordan: '#f59e0b',
  iraq: '#f59e0b',
  hejaz: '#94a3b8',
  yemen: '#94a3b8',
};

// Short explanations for the Sèvres partition colours in the legend.
export const COMPARISON_LEGEND = [
  ['#3b82f6', 'Greece'],
  ['#22c55e', 'Italy'],
  ['#a855f7', 'Allied Straits commission'],
  ['#f59e0b', 'French / British mandates'],
  ['#94a3b8', 'Arab states, no longer Ottoman'],
];
