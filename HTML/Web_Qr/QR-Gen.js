function ConvertChar(Char) {
    const Nbr = Char.charCodeAt(0); // code Unicode
    let Section, AttLen, TraChar;

    // Détermination de la section
    if (Nbr >= 32 && Nbr <= 126) {
        Section = 1;
        AttLen = 1;
        TraChar = Nbr.toString(2).padStart(8, "0"); // binaire 8 bits
    } else if (Nbr >= 161 && Nbr <= 191) {
        Section = 2;
        AttLen = 2;
        TraChar = "11000010" + Nbr.toString(2).padStart(8, "0");
    } else if (Nbr >= 192 && Nbr <= 255) {
        Section = 3;
        AttLen = 2;
        TraChar = "11000011" + (Nbr - 64).toString(2).padStart(8, "0");
    } else {
        Section = 4;
        TraChar = `${Char} n'est pas disponible pour ce générateur.`;
    }

    return [ TraChar, AttLen, Section ];
}

// --- Capacités en caractères pour chaque niveau de correction ---
const Spec_len_V_ECC = [
    [17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],
    [106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],
    [230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],
    [425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],
    [644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],
    [929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],
    [1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],
    [1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],
    [2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],
    [2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]
];

// --- Version information supérieure 7 ---
const VersionInfoSup7 = [
    "000111110010010100","001000010110111100","001001101010011001","001010010011010011",
    "001011101111110110","001100011101100010","001101100001000111","001110011000001101",
    "001111100100101000","010000101101111000","010001010001011101","010010101000010111",
    "010011010100110010","010100100110100110","010101011010000011","010110100011001001",
    "010111011111101100","011000111011000100","011001000111100001","011010111110101011",
    "011011000010001110","011100110000011010","011101001100111111","011110110101110101",
    "011111001001010000","100000100111010101","100001011011110000","100010100010111010",
    "100011011110011111","100100101100001011","100101010000101110","100110101001100100",
    "100111010101000001","101000110001101001"
];

// --- Blocks specifications ---
const Blocks_Spec = [
    [[19,7,1,19,0,0],[16,10,1,16,0,0],[13,13,1,13,0,0],[9,17,1,9,0,0]],
    [[34,10,1,34,0,0],[28,16,1,28,0,0],[22,22,1,22,0,0],[16,28,1,16,0,0]],
    [[55,15,1,55,0,0],[44,26,1,44,0,0],[34,18,2,17,0,0],[26,22,2,13,0,0]],
    [[80,20,1,80,0,0],[64,18,2,32,0,0],[48,26,2,24,0,0],[36,16,4,9,0,0]],
    [[108,26,1,108,0,0],[86,24,2,43,0,0],[62,18,2,15,2,16],[46,22,2,11,2,12]],
    [[136,18,2,68,0,0],[108,16,4,27,0,0],[76,24,4,19,0,0],[60,28,4,15,0,0]],
    [[156,20,2,78,0,0],[124,18,4,31,0,0],[88,18,2,14,4,15],[66,26,4,13,1,14]],
    [[194,24,2,97,0,0],[154,22,2,38,2,39],[110,22,4,18,2,19],[86,26,4,14,2,15]],
    [[232,30,2,116,0,0],[182,22,3,36,2,37],[132,20,4,16,4,17],[100,24,4,12,4,13]],
    [[274,18,2,68,2,69],[216,26,4,43,1,44],[154,24,6,19,2,20],[122,28,6,15,2,16]],
    [[324,20,4,81,0,0],[254,30,1,50,4,51],[180,28,4,22,4,23],[140,24,3,12,8,13]],
    [[370,24,2,92,2,93],[290,22,6,36,2,37],[206,26,4,20,6,21],[158,28,7,14,4,15]],
    [[428,26,4,107,0,0],[334,22,8,37,1,38],[244,24,8,20,4,21],[180,22,12,11,4,12]],
    [[461,30,3,115,1,116],[365,24,4,40,5,41],[261,20,11,16,5,17],[197,24,11,12,5,13]],
    [[523,22,5,87,1,88],[415,24,5,41,5,42],[295,30,5,24,7,25],[223,24,11,12,7,13]],
    [[589,24,5,98,1,99],[453,28,7,45,3,46],[325,24,15,19,2,20],[253,30,3,15,13,16]],
    [[647,28,1,107,5,108],[507,28,10,46,1,47],[367,28,1,22,15,23],[283,28,2,14,17,15]],
    [[721,30,5,120,1,121],[563,26,9,43,4,44],[397,28,17,22,1,23],[313,28,2,14,19,15]],
    [[795,28,3,113,4,114],[627,26,3,44,11,45],[445,26,17,21,4,22],[341,26,9,13,16,14]],
    [[861,28,3,107,5,108],[669,26,3,41,13,42],[485,30,15,24,5,25],[385,28,15,15,10,16]],
    [[932,28,4,116,4,117],[714,26,17,42,0,0],[512,28,17,22,6,23],[406,30,19,16,6,17]],
    [[1006,28,2,111,7,112],[782,28,17,46,0,0],[568,30,7,24,16,25],[442,24,34,13,0,0]],
    [[1094,30,4,121,5,122],[860,28,4,47,14,48],[614,30,11,24,14,25],[464,30,16,15,14,16]],
    [[1174,30,6,117,4,118],[914,28,6,45,14,46],[664,30,11,24,16,25],[514,30,30,16,2,17]],
    [[1276,26,8,106,4,107],[1000,28,8,47,13,48],[718,30,7,24,22,25],[538,30,22,15,13,16]],
    [[1370,28,10,114,2,115],[1062,28,19,46,4,47],[754,28,28,22,6,23],[596,30,33,16,4,17]],
    [[1468,30,8,122,4,123],[1128,28,22,45,3,46],[808,30,8,23,26,24],[628,30,12,15,28,16]],
    [[1531,30,3,117,10,118],[1193,28,3,45,23,46],[871,30,4,24,31,25],[661,30,11,15,31,16]],
    [[1631,30,7,116,7,117],[1267,28,21,45,7,46],[911,30,1,23,37,24],[701,30,19,15,26,16]],
    [[1735,30,5,115,10,116],[1373,28,19,47,10,48],[985,30,15,24,25,25],[745,30,23,15,25,16]],
    [[1843,30,13,115,3,116],[1455,28,2,46,29,47],[1033,30,42,24,1,25],[793,30,23,15,28,16]],
    [[1955,30,17,115,0,0],[1541,28,10,46,23,47],[1115,30,10,24,35,25],[845,30,19,15,35,16]],
    [[2071,30,17,115,1,116],[1631,28,14,46,21,47],[1171,30,29,24,19,25],[901,30,11,15,46,16]],
    [[2191,30,13,115,6,116],[1725,28,14,46,23,47],[1231,30,44,24,7,25],[961,30,59,16,1,17]],
    [[2306,30,12,121,7,122],[1812,28,12,47,26,48],[1286,30,39,24,14,25],[986,30,22,15,41,16]],
    [[2434,30,6,121,14,122],[1914,28,6,47,34,48],[1354,30,46,24,10,25],[1054,30,2,15,64,16]],
    [[2566,30,17,122,4,123],[1992,28,29,46,14,47],[1426,30,49,24,10,25],[1096,30,24,15,46,16]],
    [[2702,30,4,122,18,123],[2102,28,13,46,32,47],[1502,30,48,24,14,25],[1142,30,42,15,32,16]],
    [[2812,30,20,117,4,118],[2216,28,40,47,7,48],[1582,30,43,24,22,25],[1222,30,10,15,67,16]],
    [[2956,30,19,118,6,119],[2334,28,18,47,31,48],[1666,30,34,24,34,25],[1276,30,20,15,61,16]]
];

// --- Remainders ---
const Remainders = [
    0,7,7,7,7,7,0,0,0,0,0,0,0,3,3,3,3,3,3,3,4,4,4,4,4,4,4,3,3,3,3,3,3,3,0,0,0,0,0,0
];

const CoorPaterns = [
    [18],
    [22],
    [26],
    [30],
    [34],
    [22,38],
    [24,42],
    [26,46],
    [28,50],
    [30,54],
    [32,58],
    [34,62],
    [26,46,66],
    [26,48,70],
    [26,50,74],
    [30,54,78],
    [30,56,82],
    [30,58,86],
    [34,62,90],
    [28,50,72,94],
    [26,50,74,98],
    [30,54,78,102],
    [28,54,80,106],
    [32,58,84,110],
    [30,58,86,114],
    [34,62,90,118],
    [26,50,74,98,122],
    [30,54,78,102,126],
    [26,52,78,104,130],
    [30,56,82,108,134],
    [34,60,86,112,138],
    [30,58,86,114,142],
    [34,62,90,118,146],
    [30,54,78,102,126,150],
    [24,50,76,102,128,154],
    [28,54,80,106,132,158],
    [32,58,84,110,136,162],
    [26,54,82,110,138,166],
    [30,58,86,114,142,170]
];

const rptPattern = ["11101100", "00010001"];

const LevMaskList = [["111011111000100","111001011110011","111110110101010","111100010011101","110011000101111","110001100011000","110110001000001","110100101110110"],
                ["101010000010010","101000100100101","101111001111100","101101101001011","100010111111001","100000011001110","100111110010111","100101010100000"],
                ["011010101011111","011000001101000","011111100110001","011101000000110","010010010110100","010000110000011","010111011011010","010101111101101"],
                ["001011010001001","001001110111110","001110011100111","001100111010000","000011101100010","000001001010101","000110100001100","000100000111011"]
];

const formulas = [
    (col, row) => (col + row) % 2 === 0,               // Formula0
    (col, row) => row % 2 === 0,                       // Formula1
    (col, row) => col % 3 === 0,                       // Formula2
    (col, row) => (col + row) % 3 === 0,              // Formula3
    (col, row) => (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0, // Formula4
    (col, row) => ((row * col) % 2 + (row * col) % 3) === 0,             // Formula5
    (col, row) => (((row * col) % 2 + (row * col) % 3) % 2) === 0,       // Formula6
    (col, row) => (((row + col) % 2 + (row * col) % 3) % 2) === 0         // Formula7
];


// DataStr : ton message
// LevECC : niveau ECC (0=L,1=M,2=Q,3=H)
// Spec_len_V_ECC : tableau déjà défini

function checkQRCodeData(DataStr, LevECC) {
    let LenDataAct = 0;
    let Overflow = false;
    let UnreadChar = null;

    for (const char of DataStr) {
        const [ TraChar, AttLen, Section ] = ConvertChar(char);
        if (Section === 4) {
            // Caractère non lisible
            UnreadChar = TraChar;
            break; // on stoppe pour catch
        } else {
            LenDataAct += AttLen;
        }
    }

    // Si aucun caractère illisible, on vérifie overflow pour version 40
    if (!UnreadChar && LenDataAct > Spec_len_V_ECC[39][LevECC]) {
        Overflow = true;
    }

    return [ LenDataAct, Overflow, UnreadChar ];
}
//Renvoie LenDataAct, Overflow True si Overflow (traité en prio), UnreadChar si char non supporté

function initiateValues (DataStr, LevECC) {
    // --- Détermination de la version minimale pour le message ---
    let Version = 1;
    while (DataStr.length > Spec_len_V_ECC[Version - 1][LevECC]) {
        Version++;
    }

    // --- Capacités et informations version ---
    const LenDataMax = Spec_len_V_ECC[Version - 1][LevECC];

    let Version7sup = Version >= 7;
    let VersionInfo = Version7sup ? VersionInfoSup7[Version - 7] : null;

    // --- Informations sur les blocs ---
    const ECC_length   = Blocks_Spec[Version - 1][LevECC][1];
    const G1_Blocks    = Blocks_Spec[Version - 1][LevECC][2];
    const Len_Blocks1  = Blocks_Spec[Version - 1][LevECC][3];
    const G2_Blocks    = Blocks_Spec[Version - 1][LevECC][4];
    const Len_Blocks2  = Blocks_Spec[Version - 1][LevECC][5];

    // --- Dimensions du QR code ---
    const Rows = 21 + 4 * (Version - 1);
    const Cols = 21 + 4 * (Version - 1);

    // --- Taille du compteur de caractères ---
    const Char_Len_Count = Version < 10 ? 1 : 2;

    // --- Reste de bits pour la version ---
    const Remaind = Remainders[Version - 1];
    return {Version, LenDataMax, Version7sup, VersionInfo, ECC_length, G1_Blocks, Len_Blocks1, G2_Blocks, Len_Blocks2, Rows, Cols, Char_Len_Count, Remaind};
}

function generateEachPattern(Version, CoorPaterns) {
    const NoPatern = Version === 1;

    if (!NoPatern) {
        let NubPat, BetPat1, BetPat2;
        const Patern_used = CoorPaterns[Version - 2];
        NubPat = Patern_used.length - 1;
        BetPat1 = Patern_used[0] - 11;
        BetPat2 = (NubPat >= 2) ? (Patern_used[1] - Patern_used[0] - 5) : BetPat1;
        const Each_Patern = [];
        const Len = Patern_used.length;

        if (Len === 1) {
            Each_Patern.push([Patern_used[0], Patern_used[0]]);
        } else {
            for (let i = 0; i < Len - 1; i++) {
                Each_Patern.push([Patern_used[i], 6]);
            }

            for (let i = 0; i < Len - 1; i++) {
                Each_Patern.push([6, Patern_used[i]]);
                for (let j = 0; j < Len; j++) {
                    Each_Patern.push([Patern_used[j], Patern_used[i]]);
                }
            }

            for (let i = 0; i < Len; i++) {
                Each_Patern.push([Patern_used[i], Patern_used[Len - 1]]);
            }
        }
        return {Each_Patern, NoPatern, NubPat, BetPat1, BetPat2};
    } else return {Each_Patern: [], NoPatern, NubPat: null, BetPat1: null, BetPat2: null };
}

function initQRCodeMatrix(Rows, Cols, Each_Patern = [], Version7sup, VersionInfo) {
    // --- Initialisation DataF avec des "0"
    const DataF = Array.from({ length: Rows }, () => "0".repeat(Cols));

    // --- Place rulers (6ème ligne et colonne)
    for (let i = 0; i < Cols; i += 2) DataF[6] = DataF[6].substring(0, i) + "1" + DataF[6].substring(i + 1);
    for (let i = 0; i < Rows; i += 2) DataF[i] = DataF[i].substring(0, 6) + "1" + DataF[i].substring(7);

    // --- Place finder patterns (reco)
    const setReco = (line, start) => "1".repeat(7) + line.substring(7, Cols - 7) + "1".repeat(7);
    DataF[0] = setReco(DataF[0]); DataF[6] = setReco(DataF[6]);
    DataF[Rows - 7] = "1".repeat(7) + DataF[Rows - 7].substring(7);
    DataF[Rows - 1] = "1".repeat(7) + DataF[Rows - 1].substring(7);

    const setInnerReco = (i) => "1000001" + DataF[i].substring(7, Cols - 7) + "1000001";
    DataF[1] = setInnerReco(1); DataF[5] = setInnerReco(5);
    DataF[Rows - 6] = "1000001" + DataF[Rows - 6].substring(7);
    DataF[Rows - 2] = "1000001" + DataF[Rows - 2].substring(7);

    for (let i = 0; i < 3; i++) {
        DataF[2 + i] = "1011101" + DataF[2 + i].substring(7, Cols - 7) + "1011101";
        DataF[Rows - 5 + i] = "1011101" + DataF[Rows - 5 + i].substring(7);
    }
    DataF[Rows - 8] = DataF[Rows - 8].substring(0, 8) + "1" + DataF[Rows - 8].substring(9);

    // --- Place scalers
    for (const [x, y] of Each_Patern) {
        DataF[y - 2] = DataF[y - 2].substring(0, x - 2) + "11111" + DataF[y - 2].substring(x + 3);
        DataF[y - 1] = DataF[y - 1].substring(0, x - 2) + "10001" + DataF[y - 1].substring(x + 3);
        DataF[y]     = DataF[y].substring(0, x - 2) + "10101" + DataF[y].substring(x + 3);
        DataF[y + 1] = DataF[y + 1].substring(0, x - 2) + "10001" + DataF[y + 1].substring(x + 3);
        DataF[y + 2] = DataF[y + 2].substring(0, x - 2) + "11111" + DataF[y + 2].substring(x + 3);
    }

    // --- Place version (si QR ≥ 7)
    if (Version7sup) {
        const Horiz = [], Verti = [];
        for (let i = 0; i < 3; i++) {
            let lineH = "";
            for (let j = 0; j < 6; j++) lineH += VersionInfo[17 - i - 3 * j];
            Horiz.push(lineH);
        }
        for (let i = 0; i < 6; i++) {
            let lineV = "";
            for (let j = 0; j < 3; j++) lineV += VersionInfo[17 - 3 * i - j];
            Verti.push(lineV);
        }
        for (let i = 0; i < 6; i++) DataF[i] = DataF[i].substring(0, Cols - 11) + Verti[i] + DataF[i].substring(Cols - 8);
        for (let i = 0; i < 3; i++) DataF[Rows - 11 + i] = Horiz[i] + DataF[Rows - 11 + i].substring(6);
    }
    return DataF;
}

function organizeDataForQR(
    DataStr, LenDataMax, CharLenCount, LenDataAct,
    LenBlock1, LenBlock2, Blocks1, Blocks2, rptPattern
) {
    const Mode = "0100"; // Byte Mode

    // --- Encode chaque caractère
    const EncodeChar = (Data) => {
        let final = "";
        for (const c of Data) {
            const [TraChar, AttLen, Section] = ConvertChar(c);
            final += TraChar;
        }
        return final + "0000"; // Terminateur
    };

    // --- Remplissage du message pour atteindre LenDataMax
    const FillDL = (Data, rpt, LenDataAct, MaxLen) => {
        const Rest = MaxLen - LenDataAct;
        for (let i = 0; i < Rest; i++) Data += rpt[i % 2];
        return Data;
    };

    // --- Découpe les chaînes binaires en nombres 0-255 pour ECC
    const SplitMess = (Message) => {
        return Message.map(item => {
            const Numbs = [];
            let Actu = item;
            while (Actu.length >= 8) {
                let FNumb = 0;
                const actuNBbin = Actu.slice(0, 8);
                Actu = Actu.slice(8);
                for (let j = 0; j < 8; j++) if (actuNBbin[j] === "1") FNumb += 2 ** (7 - j);
                Numbs.push(FNumb);
            }
            return Numbs;
        });
    };

    // --- Découpe le flux binaire en blocs pour ECC
    const Grouping = (DataLong, LenBlock1, LenBlock2, Blocks1, Blocks2) => {
        const Blocks = [];
        for (let i = 0; i < Blocks1; i++) {
            Blocks.push(DataLong.slice(0, LenBlock1 * 8));
            DataLong = DataLong.slice(LenBlock1 * 8);
        }
        for (let i = 0; i < Blocks2; i++) {
            Blocks.push(DataLong.slice(0, LenBlock2 * 8));
            DataLong = DataLong.slice(LenBlock2 * 8);
        }
        return Blocks;
    };

    // --- Construction du flux complet
    let DataLong = Mode;
    const Count = LenDataAct.toString(2).padStart(CharLenCount*8, "0");
    DataLong += Count;
    DataLong += EncodeChar(DataStr);
    DataLong = FillDL(DataLong, rptPattern, LenDataAct, LenDataMax);

    // --- Découpe en blocs
    const Blocks = Grouping(DataLong, LenBlock1, LenBlock2, Blocks1, Blocks2);

    // --- Conversion des blocs en nombres pour ECC
    const ListNumbersECC = SplitMess(Blocks);

    return { Blocks, ListNumbersECC };
}

function generateFinalData(ListNumbersECC, Blocks, G1_Blocks, G2_Blocks, Len_Blocks1, ECC_length, Remaind) {

    // --- 1. Génération du champ de Galois
    const gf_exp = new Array(512).fill(0);
    const gf_log = new Array(256).fill(0);
    let x = 1;
    for (let i = 0; i < 255; i++) {
        gf_exp[i] = x;
        gf_log[x] = i;
        x <<= 1;
        if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) gf_exp[i] = gf_exp[i - 255];

    // --- 2. Polynôme générateur RS
    function rsGeneratorPoly(degree) {
        let gen = [1];
        for (let i = 0; i < degree; i++) {
            const next_gen = new Array(gen.length + 1).fill(0);
            for (let j = 0; j < gen.length; j++) {
                next_gen[j] ^= gen[j];
                if (gen[j] !== 0) next_gen[j + 1] ^= gf_exp[(gf_log[gen[j]] + i) % 255];
            }
            gen = next_gen;
        }
        return gen.map(g => g % 256);
    }

    // --- 3. Encodage RS pour un bloc
    function rsEncodeMessage(message, ecc_length) {
        const gen_poly = rsGeneratorPoly(ecc_length);
        const message_poly = [...message, ...new Array(ecc_length).fill(0)];

        for (let i = 0; i < message.length; i++) {
            const coef = message_poly[i];
            if (coef !== 0) {
                for (let j = 0; j < gen_poly.length; j++) {
                    const val = gen_poly[j];
                    if (val !== 0) {
                        message_poly[i + j] ^= gf_exp[(gf_log[coef] + gf_log[val]) % 255];
                    }
                }
            }
        }
        return message_poly.slice(-ecc_length);
    }

    // --- 4. Génération de tous les ECCs
    const ECCs = [];
    for (let i = 0; i < G1_Blocks; i++) ECCs.push(rsEncodeMessage(ListNumbersECC[i], ECC_length));
    for (let i = 0; i < G2_Blocks; i++) ECCs.push(rsEncodeMessage(ListNumbersECC[i + G1_Blocks], ECC_length));

    // --- 5. Conversion ECCs en binaire
    const ECCs_bin = ECCs.map(item =>
        item.map(v => v.toString(2).padStart(8, "0"))
    );

    // --- 6. Organisation des flux Data et ECC
    let DataLong = "";
    let ECCf = "";

    // Données intercalées
    for (let i = 0; i < Len_Blocks1; i++) {
        for (let j = 0; j < G1_Blocks + G2_Blocks; j++) {
            const block = Blocks[j];
            const IntStr = block.slice(0, 8);
            Blocks[j] = block.slice(8);
            DataLong += IntStr;
        }
    }
    if (G2_Blocks !== 0) {
        for (let i = 0; i < G2_Blocks; i++) {
            const block = Blocks[i + G1_Blocks];
            const IntStr = block.slice(0, 8);
            Blocks[i + G1_Blocks] = block.slice(8);
            DataLong += IntStr;
        }
    }

    // ECCs intercalés
    for (let k = 0; k < ECC_length; k++) {
        for (let l = 0; l < G1_Blocks + G2_Blocks; l++) {
            ECCf += ECCs_bin[l][k];
        }
    }

    // --- 7. Flux final avec bits restants
    return DataLong + ECCf + "0".repeat(Remaind);
}

function pathQR(DataF, FINALDATA, NubPat, BetPat1, BetPat2, Version, Cols, Rows, NoPatern) {

    const UP = (FINALDATA, DataF, height, xstart, ystart) => {
        for (let i = 0; i < height; i++) {
            let line = DataF[ystart - i];
            line = line.slice(0, xstart) + FINALDATA[1] + FINALDATA[0] + line.slice(xstart + 2);
            FINALDATA = FINALDATA.slice(2);
            DataF[ystart - i] = line;
        }
        return [DataF, FINALDATA];
    };

    const DO = (FINALDATA, DataF, height, xstart, ystart) => {
        for (let i = 0; i < height; i++) {
            let line = DataF[ystart + i];
            line = line.slice(0, xstart) + FINALDATA[1] + FINALDATA[0] + line.slice(xstart + 2);
            FINALDATA = FINALDATA.slice(2);
            DataF[ystart + i] = line;
        }
        return [DataF, FINALDATA];
    };

    const LOUNGE = (FINALDATA, DataF, height, xstart, ystart, orientation) => {
        for (let i = 0; i < height; i++) {
            const y = orientation ? ystart - i : ystart + i;
            let line = DataF[y];
            line = line.slice(0, xstart) + FINALDATA[0] + line.slice(xstart + 1);
            FINALDATA = FINALDATA.slice(1);
            DataF[y] = line;
        }
        return [DataF, FINALDATA];
    };

    const OVERPAT = (Times, BetPat2, DataF, FINALDATA, orientation, xstart, ystart, pixonst) => {
        if (orientation) {
            [DataF, FINALDATA] = UP(FINALDATA, DataF, pixonst, xstart, ystart);
            for (let i = 0; i < Times; i++) {
                [DataF, FINALDATA] = UP(FINALDATA, DataF, BetPat2, xstart, ystart - pixonst - 5 * (i + 1) - BetPat2 * i);
            }
        } else {
            [DataF, FINALDATA] = DO(FINALDATA, DataF, pixonst, xstart, ystart);
            for (let i = 0; i < Times; i++) {
                [DataF, FINALDATA] = DO(FINALDATA, DataF, BetPat2, xstart, ystart + pixonst + 5 * (i + 1) + BetPat2 * i);
            }
        }
        return [DataF, FINALDATA];
    };

    const LONGLOUNGE = (Times, BetPat1, BetPat2, orientation, DataF, FINALDATA, xstart, ystart) => {
        if (orientation) {
            [DataF, FINALDATA] = UP(FINALDATA, DataF, 4, xstart, ystart);
            [DataF, FINALDATA] = LOUNGE(FINALDATA, DataF, 5, xstart, ystart - 4, true);
            for (let i = 0; i < Times; i++) {
                [DataF, FINALDATA] = UP(FINALDATA, DataF, BetPat2, xstart, ystart - 4 - 5 * (i + 1) - BetPat2 * i);
                [DataF, FINALDATA] = LOUNGE(FINALDATA, DataF, 5, xstart, ystart - 4 - (i + 1) * (5 + BetPat2), true);
            }
            [DataF, FINALDATA] = UP(FINALDATA, DataF, BetPat1, xstart, 8 + BetPat1);
            [DataF, FINALDATA] = LOUNGE(FINALDATA, DataF, 2, xstart, 8, true);
            [DataF, FINALDATA] = LOUNGE(FINALDATA, DataF, 2, xstart, 5, true);
            [DataF, FINALDATA] = UP(FINALDATA, DataF, 4, xstart, 3);
        } else {
            [DataF, FINALDATA] = DO(FINALDATA, DataF, 4, xstart, 0);
            [DataF, FINALDATA] = LOUNGE(FINALDATA, DataF, 2, xstart, 4, false);
            [DataF, FINALDATA] = LOUNGE(FINALDATA, DataF, 2, xstart, 7, false);
            [DataF, FINALDATA] = DO(FINALDATA, DataF, BetPat1, xstart, 9);
            [DataF, FINALDATA] = LOUNGE(FINALDATA, DataF, 5, xstart, 9 + BetPat1, false);
            for (let i = 0; i < Times; i++) {
                [DataF, FINALDATA] = DO(FINALDATA, DataF, BetPat2, xstart, BetPat1 + 9 + 5 * (i + 1) + BetPat2 * i);
                [DataF, FINALDATA] = LOUNGE(FINALDATA, DataF, 5, xstart, BetPat1 + 9 + (i + 1) * (5 + BetPat2), false);
            }
            [DataF, FINALDATA] = DO(FINALDATA, DataF, 4, xstart, ystart - 3);
        }
        return [DataF, FINALDATA];
    };

    const MEDLOUNGE = (Times, BetPat1, BetPat2, DataF, FINALDATA, xstart, ystart) => {
        [DataF, FINALDATA] = UP(FINALDATA, DataF, 4, xstart, ystart);
        [DataF, FINALDATA] = LOUNGE(FINALDATA, DataF, 5, xstart, ystart - 4, true);
        for (let i = 0; i < Times; i++) {
            [DataF, FINALDATA] = UP(FINALDATA, DataF, BetPat2, xstart, ystart - 4 - 5 * (i + 1) - BetPat2 * i);
            [DataF, FINALDATA] = LOUNGE(FINALDATA, DataF, 5, xstart, ystart - 4 - (i + 1) * (5 + BetPat2), true);
        }
        [DataF, FINALDATA] = UP(FINALDATA, DataF, BetPat1 + 2, xstart, 8 + BetPat1);
        return [DataF, FINALDATA];
    };

    const LONG = (DataF, FINALDATA, xstart, ystart, orientation) => {
        if (orientation) {
            [DataF, FINALDATA] = UP(FINALDATA, DataF, ystart - 6, xstart, ystart);
            [DataF, FINALDATA] = UP(FINALDATA, DataF, 6, xstart, 5);
        } else {
            [DataF, FINALDATA] = DO(FINALDATA, DataF, 6, xstart, 0);
            [DataF, FINALDATA] = DO(FINALDATA, DataF, ystart - 6, xstart, 7);
        }
        return [DataF, FINALDATA];
    };

    // --- Fonction principale pathing
    const REPAT = (DataF, FINALDATA, NubPat, xstart, Rows, orientation) => {
        if (orientation) {
            [DataF, FINALDATA] = OVERPAT(NubPat, BetPat2, DataF, FINALDATA, true, xstart, Rows - 1, 4);
            [DataF, FINALDATA] = UP(FINALDATA, DataF, BetPat1, xstart, 8 + BetPat1);
            [DataF, FINALDATA] = UP(FINALDATA, DataF, 4, xstart, 3);
            [DataF, FINALDATA] = DO(FINALDATA, DataF, 4, xstart - 2, 0);
            [DataF, FINALDATA] = OVERPAT(NubPat, BetPat2, DataF, FINALDATA, false, xstart - 2, 9, BetPat1);
            [DataF, FINALDATA] = DO(FINALDATA, DataF, 4, xstart - 2, Rows - 4);
            [DataF, FINALDATA] = LONGLOUNGE(NubPat, BetPat1, BetPat2, true, DataF, FINALDATA, xstart - 4, Rows - 1);
        } else {
            [DataF, FINALDATA] = DO(FINALDATA, DataF, 4, xstart, 0);
            [DataF, FINALDATA] = OVERPAT(NubPat, BetPat2, DataF, FINALDATA, false, xstart, 9, BetPat1);
            [DataF, FINALDATA] = DO(FINALDATA, DataF, 4, xstart, Rows - 4);
            [DataF, FINALDATA] = OVERPAT(NubPat, BetPat2, DataF, FINALDATA, true, xstart - 2, Rows - 1, 4);
            [DataF, FINALDATA] = UP(FINALDATA, DataF, BetPat1, xstart - 2, 8 + BetPat1);
            [DataF, FINALDATA] = UP(FINALDATA, DataF, 4, xstart - 2, 3);
            [DataF, FINALDATA] = LONGLOUNGE(NubPat, BetPat1, BetPat2, false, DataF, FINALDATA, xstart - 4, Rows - 1);
        }
        return [DataF, FINALDATA];
    };

    //fillQR
    if (!NoPatern) {
        let SavesPoss = Math.floor((BetPat2 - 1) / 4);
        let Rest = ((BetPat2 - 1) % 4) === 2;
        let orientationprev = true, invorientationprev = false, lastori;

        // Début du chemin principal
        [DataF, FINALDATA] = UP(FINALDATA, DataF, Rows - 9, Cols - 2, Rows - 1);
        [DataF, FINALDATA] = DO(FINALDATA, DataF, Rows - 9, Cols - 4, 9);
        [DataF, FINALDATA] = OVERPAT(NubPat, BetPat2, DataF, FINALDATA, true, Cols - 6, Rows - 1, 4);
        [DataF, FINALDATA] = UP(FINALDATA, DataF, BetPat1, Cols - 6, 8 + BetPat1);
        [DataF, FINALDATA] = OVERPAT(NubPat, BetPat2, DataF, FINALDATA, false, Cols - 8, 9, BetPat1);
        [DataF, FINALDATA] = DO(FINALDATA, DataF, 4, Cols - 8, Rows - 4);
        [DataF, FINALDATA] = MEDLOUNGE(NubPat, BetPat1, BetPat2, DataF, FINALDATA, Cols - 10, Rows - 1);

        if (Version < 7) {
            [DataF, FINALDATA] = UP(FINALDATA, DataF, 6, Cols - 10, 5);
            for (let i = 0; i < SavesPoss; i++) {
                [DataF, FINALDATA] = LONG(DataF, FINALDATA, Cols - 12 - 4 * i, Rows - 1, false);
                [DataF, FINALDATA] = LONG(DataF, FINALDATA, Cols - 14 - 4 * i, Rows - 1, true);
            }
            if (Rest) [DataF, FINALDATA] = LONG(DataF, FINALDATA, Cols - 9 - BetPat1, Rows - 1, false);
        } else {
            [DataF, FINALDATA] = LOUNGE(FINALDATA, DataF, 6, Cols - 12, 0, false);
            [DataF, FINALDATA] = DO(FINALDATA, DataF, Rows - 7, Cols - 12, 7);
            let Times = Rest ? SavesPoss : SavesPoss - 1;
            for (let i = 0; i < Times; i++) {
                [DataF, FINALDATA] = LONG(DataF, FINALDATA, Cols - 14 - 4 * i, Rows - 1, true);
                [DataF, FINALDATA] = LONG(DataF, FINALDATA, Cols - 16 - 4 * i, Rows - 1, false);
            }
            if (!Rest) {
                [DataF, FINALDATA] = LONG(DataF, FINALDATA, Cols - 9 - BetPat2, Rows - 1, true);
                [DataF, FINALDATA] = REPAT(DataF, FINALDATA, NubPat, Cols - 11 - BetPat2, Rows, false);
            } else {
                [DataF, FINALDATA] = REPAT(DataF, FINALDATA, NubPat, Cols - 11 - BetPat2, Rows, true);
            }
        }

        for (let NP = 0; NP < NubPat - 1; NP++) {
            if (!Rest) {
                for (let i = 0; i < SavesPoss; i++) {
                    [DataF, FINALDATA] = LONG(DataF, FINALDATA, Cols - 17 - BetPat2 * (NP + 1) - 4 * i - 5 * NP, Rows - 1, orientationprev);
                    [DataF, FINALDATA] = LONG(DataF, FINALDATA, Cols - 19 - BetPat2 * (NP + 1) - 4 * i - 5 * NP, Rows - 1, invorientationprev);
                }
                [DataF, FINALDATA] = REPAT(DataF, FINALDATA, NubPat, Cols - 17 - BetPat2 * (NP + 1) - 4 * SavesPoss - 5 * NP, Rows, orientationprev);
                [orientationprev, invorientationprev] = [invorientationprev, orientationprev];
                lastori = orientationprev;
            } else {
                for (let i = 0; i < SavesPoss; i++) {
                    [DataF, FINALDATA] = LONG(DataF, FINALDATA, Cols - 17 - BetPat2 * (NP + 1) - 4 * i - 5 * NP, Rows - 1, false);
                    [DataF, FINALDATA] = LONG(DataF, FINALDATA, Cols - 19 - BetPat2 * (NP + 1) - 4 * i - 5 * NP, Rows - 1, true);
                }
                [DataF, FINALDATA] = LONG(DataF, FINALDATA, Cols - 17 - BetPat2 * (NP + 1) - 4 * SavesPoss - 5 * NP, Rows - 1, false);
                [DataF, FINALDATA] = REPAT(DataF, FINALDATA, NubPat, Cols - 19 - BetPat2 * (NP + 1) - 4 * SavesPoss - 5 * NP, Rows, true);
            }
            SavesPoss = Math.floor((BetPat2 - 1) / 4);
        }

        if (Version >= 7) {
            let orient = !Rest && NubPat > 1 && !lastori;
            let invorient = !orient;
            let SavesPoss2 = Math.floor((BetPat1 - 1) / 4);
            let Rest2 = (BetPat1 - 1) % 4 === 2;
            for (let i = 0; i < SavesPoss2; i++) {
                [DataF, FINALDATA] = LONG(DataF, FINALDATA, 6 + BetPat1 - 4 * i, Rows - 1, orient);
                [DataF, FINALDATA] = LONG(DataF, FINALDATA, 4 + BetPat1 - 4 * i, Rows - 1, invorient);
            }
            if (Rest2) [DataF, FINALDATA] = LONG(DataF, FINALDATA, 9, Rows - 1, orient);
        }

        if (Version >= 7) {
            [DataF, FINALDATA] = OVERPAT(NubPat - 1, BetPat2, DataF, FINALDATA, true, 7, Rows - 9, BetPat2 + 1);
            [DataF, FINALDATA] = UP(FINALDATA, DataF, BetPat1, 7, 8 + BetPat1);
            [DataF, FINALDATA] = OVERPAT(NubPat - 1, BetPat2, DataF, FINALDATA, false, 4, 9, BetPat1);
            [DataF, FINALDATA] = DO(FINALDATA, DataF, BetPat2 - 2, 4, Rows - 9 - BetPat2);
            [DataF, FINALDATA] = UP(FINALDATA, DataF, Rows - 20, 2, Rows - 12);
            [DataF, FINALDATA] = DO(FINALDATA, DataF, Rows - 20, 0, 9);
        } else {
            [DataF, FINALDATA] = UP(FINALDATA, DataF, BetPat1 + 1, 7, Rows - 9);
            [DataF, FINALDATA] = DO(FINALDATA, DataF, BetPat1 + 1, 4, 9);
            [DataF, FINALDATA] = UP(FINALDATA, DataF, Rows - 17, 2, Rows - 9);
            [DataF, FINALDATA] = DO(FINALDATA, DataF, Rows - 17, 0, 9);
        }
    } else { 
        for (let i = 0; i < 2; i++) {
            [DataF, FINALDATA] = UP(FINALDATA, DataF, 12, 19 - 4 * i, 20);
            [DataF, FINALDATA] = DO(FINALDATA, DataF, 12, 17 - 4 * i, 9);
        }

        [DataF, FINALDATA] = UP(FINALDATA, DataF, 14, 11, 20);
        [DataF, FINALDATA] = UP(FINALDATA, DataF, 6, 11, 5);
        [DataF, FINALDATA] = DO(FINALDATA, DataF, 6, 9, 0);
        [DataF, FINALDATA] = DO(FINALDATA, DataF, 14, 9, 7);
        [DataF, FINALDATA] = UP(FINALDATA, DataF, 4, 7, 12);
        [DataF, FINALDATA] = DO(FINALDATA, DataF, 4, 4, 9);
        [DataF, FINALDATA] = UP(FINALDATA, DataF, 4, 2, 12);
        [DataF, FINALDATA] = DO(FINALDATA, DataF, 4, 0, 9);
    }
    return DataF;
}

function affect(col, row, DataF, formN) {
    if (formN >= 0 && formN <= 7) {
        const value = formulas[formN](col, row);
        if (value) {
            DataF[row] = DataF[row].slice(0, col) +
                         (DataF[row][col] === "1" ? "0" : "1") +
                         DataF[row].slice(col + 1);
        }
    } else if (formN === 8) {
        DataF[row] = DataF[row].slice(0, col) +
                     (DataF[row][col] === "1" ? "2" : "1") +
                     DataF[row].slice(col + 1);
    }
    return DataF;
}

function Rule1(DataF, Cols, Rows) {
    let Score = 0;

    // Horizontal
    for (let r = 0; r < Rows; r++) {
        let runChar = null;
        let runLen = 0;

        for (let c = 0; c < Cols; c++) {
            const char = DataF[r][c];
            if (char === runChar) {
                runLen++;
            } else {
                runChar = char;
                runLen = 1;
            }

            if (runLen === 5) Score += 3;
            else if (runLen > 5) Score += 1;
        }
    }

    // Vertical
    for (let c = 0; c < Cols; c++) {
        let runChar = null;
        let runLen = 0;

        for (let r = 0; r < Rows; r++) {
            const char = DataF[r][c];
            if (char === runChar) {
                runLen++;
            } else {
                runChar = char;
                runLen = 1;
            }

            if (runLen === 5) Score += 3;
            else if (runLen > 5) Score += 1;
        }
    }

    return Score;
}

function Rule2(DataF, Cols, Rows) {
    let Score = 0;

    for (let r = 0; r < Rows - 1; r++) {
        const row0 = DataF[r];
        const row1 = DataF[r + 1];

        for (let c = 0; c < Cols - 1; c++) {
            const char = row0[c];
            if (
                char === row0[c + 1] &&
                char === row1[c] &&
                char === row1[c + 1]
            ) {
                Score += 3;
            }
        }
    }

    return Score;
}

function Rule3(DataF, Cols, Rows) {
    let Score = 0;
    const pattern1 = "10111010000";
    const pattern2 = "00001011101";

    // Horizontal
    for (let r = 0; r < Rows; r++) {
        const row = DataF[r];
        for (let c = 0; c <= Cols - 11; c++) {
            const seg = row.slice(c, c + 11);
            if (seg === pattern1 || seg === pattern2) {
                const before = row.slice(Math.max(0, c - 4), c);
                const after = row.slice(c + 11, c + 15);
                if (before === "0000" || after === "0000") Score += 40;
            }
        }
    }

    // Vertical
    for (let c = 0; c < Cols; c++) {
        for (let r = 0; r <= Rows - 11; r++) {
            let match = true;
            for (let i = 0; i < 11; i++) {
                const char = DataF[r + i][c];
                if (
                    char !== pattern1[i] &&
                    char !== pattern2[i]
                ) {
                    match = false;
                    break;
                }
            }
            if (!match) continue;

            // before/after
            let before = "";
            let after = "";
            for (let i = 0; i < 4; i++) {
                if (r - i - 1 >= 0) before += DataF[r - i - 1][c];
                if (r + 11 + i < Rows) after += DataF[r + 11 + i][c];
            }
            if (before === "0000" || after === "0000") Score += 40;
        }
    }

    return Score;
}

function Rule4(DataF, Cols, Rows) {
    let bdots = 0;

    for (let r = 0; r < Rows; r++) {
        const row = DataF[r];
        for (let c = 0; c < Cols; c++) {
            if (row[c] === "1") bdots++;
        }
    }

    const Percentage = (bdots / (Rows * Cols)) * 100;
    let low = Math.floor(Percentage / 5) * 5;
    let high = low + 5;

    low = low < 50 ? 50 - low : low - 50;
    high = high < 50 ? 50 - high : high - 50;

    return 10 * Math.min(low, high) / 5;
}

function InsMLECC(IntList, Mask, DataF, Cols, Rows) {
    const bits = IntList[Mask];

    // Ligne 8
    DataF[8] =
        bits.slice(0, 6) + "1" + bits.slice(6, 8) +
        DataF[8].slice(9, Cols - 8) +
        bits.slice(7);

    // Ligne 7
    DataF[7] = DataF[7].slice(0, 8) + bits[8] + DataF[7].slice(9);

    // Lignes 5 à 0
    for (let i = 0; i < 6; i++) {
        const row = 5 - i;
        DataF[row] = DataF[row].slice(0, 8) + bits[9 + i] + DataF[row].slice(9);
    }

    // Dernières lignes en bas
    for (let i = 0; i < 7; i++) {
        const row = Rows - i - 1;
        DataF[row] = DataF[row].slice(0, 8) + bits[i] + DataF[row].slice(9);
    }

    return DataF;
}

function MASKBLOCK(DataF, xlen, ylen, xstart, ystart, Nfor) {
    for (let r = 0; r < ylen; r++) {
        for (let c = 0; c < xlen; c++) {
            DataF = affect(c + xstart, r + ystart, DataF, Nfor);
        }
    }
    return DataF;
}

function ApplyMask1(DataF, Nfor) {
    DataF = MASKBLOCK(DataF, 4, 6, 9, 0, Nfor);
    DataF = MASKBLOCK(DataF, 4, 2, 9, 7, Nfor);
    DataF = MASKBLOCK(DataF, 6, 4, 0, 9, Nfor);
    DataF = MASKBLOCK(DataF, 14, 4, 7, 9, Nfor);
    DataF = MASKBLOCK(DataF, 12, 8, 9, 13, Nfor);
    return DataF;
}

function ApplyMask(DataF, Nfor, NubPat, BetPat1, BetPat2, Cols, Rows) {
    if (NubPat >= 1) {
        // Bloc horizontal haut
        DataF = MASKBLOCK(DataF, BetPat1 + 5 * NubPat + (NubPat - 1) * BetPat2 + BetPat2 - 2, 4, 9, 0, Nfor);
        DataF = MASKBLOCK(DataF, BetPat1, 2, 9, 4, Nfor);
        for (let i = 0; i < NubPat - 1; i++) {
            DataF = MASKBLOCK(DataF, BetPat2, 2, 9 + BetPat1 + 5 * (i + 1) + BetPat2 * i, 4, Nfor);
        }
        DataF = MASKBLOCK(DataF, BetPat2 - 2, 2, 9 + BetPat1 + 5 * NubPat + BetPat2 * (NubPat - 1), 4, Nfor);

        // Bloc horizontal bas
        DataF = MASKBLOCK(DataF, BetPat1, 2, 9, 7, Nfor);
        for (let i = 0; i < NubPat - 1; i++) {
            DataF = MASKBLOCK(DataF, BetPat2, 2, 9 + BetPat1 + 5 * (i + 1) + BetPat2 * i, 7, Nfor);
        }
        DataF = MASKBLOCK(DataF, BetPat2 + 1, 2, 9 + BetPat1 + 5 * NubPat + BetPat2 * (NubPat - 1), 7, Nfor);

        // Bloc vertical gauche
        DataF = MASKBLOCK(DataF, 4, BetPat1 + 5 * NubPat + (NubPat - 1) * BetPat2 + BetPat2 - 2, 0, 9, Nfor);
        DataF = MASKBLOCK(DataF, 2, BetPat1, 4, 9, Nfor);
        for (let i = 0; i < NubPat - 1; i++) {
            DataF = MASKBLOCK(DataF, 2, BetPat2, 4, 9 + BetPat1 + 5 * (i + 1) + BetPat2 * i, Nfor);
        }
        DataF = MASKBLOCK(DataF, 2, BetPat2 - 2, 4, 9 + BetPat1 + 5 * NubPat + BetPat2 * (NubPat - 1), Nfor);

        // Bloc vertical droite
        DataF = MASKBLOCK(DataF, 2, BetPat1, 7, 9, Nfor);
        for (let i = 0; i < NubPat - 1; i++) {
            DataF = MASKBLOCK(DataF, 2, BetPat2, 7, 9 + BetPat1 + 5 * (i + 1) + BetPat2 * i, Nfor);
        }
        DataF = MASKBLOCK(DataF, 2, BetPat2 + 1, 7, 9 + BetPat1 + 5 * NubPat + BetPat2 * (NubPat - 1), Nfor);

        // Bloc central droit
        DataF = MASKBLOCK(DataF, Cols - 9, BetPat1, 9, 9, Nfor);
        for (let i = 0; i < NubPat; i++) {
            DataF = MASKBLOCK(DataF, Cols - 9, BetPat2, 9, 9 + BetPat1 + 5 * (i + 1) + BetPat2 * i, Nfor);
        }

        // Blocs imbriqués
        for (let i = 0; i < NubPat + 1; i++) {
            DataF = MASKBLOCK(DataF, BetPat1, 5, 9, 9 + BetPat1 + i * (5 + BetPat2), Nfor);
            for (let j = 0; j < NubPat; j++) {
                DataF = MASKBLOCK(DataF, BetPat2, 5, 9 + BetPat1 + 5 * (j + 1) + BetPat2 * j, 9 + BetPat1 + i * (5 + BetPat2), Nfor);
            }
            DataF = MASKBLOCK(DataF, 4, 5, Cols - 4, 9 + BetPat1 + i * (5 + BetPat2), Nfor);
        }

        // Bloc bas
        DataF = MASKBLOCK(DataF, Cols - 9, 4, 9, Rows - 4, Nfor);

    } else {
        // Cas NubPat = 0
        DataF = MASKBLOCK(DataF, BetPat1 + 1, 6, 9, 0, Nfor);
        DataF = MASKBLOCK(DataF, BetPat1 + 1, 2, 9, 7, Nfor);
        DataF = MASKBLOCK(DataF, 6, BetPat1 + 1, 0, 9, Nfor);
        DataF = MASKBLOCK(DataF, 2, BetPat1 + 1, 7, 9, Nfor);
        DataF = MASKBLOCK(DataF, Cols - 9, BetPat1, 9, 9, Nfor);
        DataF = MASKBLOCK(DataF, BetPat1, 5, 9, Rows - 9, Nfor);
        DataF = MASKBLOCK(DataF, 4, 5, Cols - 4, Rows - 9, Nfor);
        DataF = MASKBLOCK(DataF, Cols - 9, 4, 9, Rows - 4, Nfor);
    }

    return DataF;
}

function PenalScore(DataF, Rows, Cols) {
    let score = 0;
    score += Rule1(DataF, Cols, Rows);
    score += Rule2(DataF, Cols, Rows);
    score += Rule3(DataF, Cols, Rows);
    score += Rule4(DataF, Cols, Rows);
    return score;
}

function ChPattern(NoPatern, DataF, Rows, Cols, IntList, NubPat, BetPat1, BetPat2) {
    const Scores = [];
    const AltData = DataF.slice(); // copie superficielle
    const cloneDataF = () => AltData.map(row => row.slice()); // fonction pour copier les lignes

    for (let mask = 0; mask < 8; mask++) {
        let DataCopy = cloneDataF();
        if (NoPatern) {
            DataCopy = ApplyMask1(DataCopy, mask);
        } else {
            DataCopy = ApplyMask(DataCopy, mask, NubPat, BetPat1, BetPat2, Cols, Rows);
        }
        DataCopy = InsMLECC(IntList, mask, DataCopy, Cols, Rows);
        Scores.push(PenalScore(DataCopy, Rows, Cols));
    }

    // Trouver le masque avec le score minimum
    let Mini = Scores[0];
    let bestMask = 0;
    for (let i = 1; i < 8; i++) {
        if (Scores[i] < Mini) {
            Mini = Scores[i];
            bestMask = i;
        }
    }

    // Appliquer le meilleur masque
    let DataFINAL = cloneDataF();
    if (NoPatern) {
        DataFINAL = ApplyMask1(DataFINAL, bestMask);
    } else {
        DataFINAL = ApplyMask(DataFINAL, bestMask, NubPat, BetPat1, BetPat2, Cols, Rows);
    }
    DataFINAL = InsMLECC(IntList, bestMask, DataFINAL, Cols, Rows);

    return DataFINAL;
}

function whitearound(DataFINAL, Cols) {
    const zeroLine = "0".repeat(Cols + 8);
    const result = [];

    for (let i = 0; i < 4; i++) {
        result.push(zeroLine);
    }

    for (const row of DataFINAL) {
        result.push("0".repeat(4) + row + "0".repeat(4));
    }

    for (let i = 0; i < 4; i++) {
        result.push(zeroLine);
    }
    return result;
}

function generateQRCode(LevECC, DataStr) {
    const [LenDataAct, Overflow, UnreadChar] = checkQRCodeData(DataStr,LevECC);
    if (!Overflow && UnreadChar === null) {
        const {Version, LenDataMax, Version7sup, VersionInfo, ECC_length, G1_Blocks, Len_Blocks1, G2_Blocks, Len_Blocks2, Rows, Cols, Char_Len_Count, Remaind} = initiateValues(DataStr, LevECC);
        const {Each_Patern, NoPatern, NubPat, BetPat1, BetPat2} = generateEachPattern(Version, CoorPaterns);
        const DataF1 = initQRCodeMatrix(Rows, Cols, Each_Patern, Version7sup, Version7sup ? VersionInfo : null);
        const { Blocks, ListNumbersECC } = organizeDataForQR(DataStr, LenDataMax, Char_Len_Count, LenDataAct, Len_Blocks1, Len_Blocks2, G1_Blocks, G2_Blocks, rptPattern);
        const FINALDATA = generateFinalData(ListNumbersECC, Blocks, G1_Blocks, G2_Blocks, Len_Blocks1, ECC_length, Remaind);
        const DataF2 = pathQR(DataF1, FINALDATA, NubPat, BetPat1, BetPat2, Version, Cols, Rows, NoPatern);
        const IntList = LevMaskList[LevECC];
        const DataFIN = ChPattern(NoPatern, DataF2, Rows, Cols, IntList, NubPat, BetPat1, BetPat2);
        const DataFINAL = whitearound(DataFIN, Cols);
        return [DataFINAL, Overflow, UnreadChar];
    } else {
        return [[""], Overflow, UnreadChar];
    }
};

// const [QR, Overflow, UnreadChar] = generateQRCode(3, "BiduleBiduleBiduleBiduleBiduleBiduleBiduleBiduleBiduleBiduleBiduleBiduleBiduleBiduleBidule");
// console.log(QR);

function drawQRCodeRevealFromCenter(ctx, QRMatrix, canvas, style) {
    style = Number(style);
    const rows = QRMatrix.length;
    const cols = QRMatrix[0].length;

    const canvasSize = canvas.width;
    const moduleSize = Math.floor(canvasSize / Math.max(rows, cols));
    const qrSize = moduleSize * Math.max(rows, cols);
    const offset = Math.floor((canvasSize - qrSize) / 2);

    // Nettoyage + fond blanc
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    const cx = Math.floor(cols / 2);
    const cy = Math.floor(rows / 2);
    const maxRadius = Math.max(cx, cy);

    let radius = 0;

    function drawRing() {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const dx = Math.abs(x - cx);
                const dy = Math.abs(y - cy);

                // On dessine uniquement les modules à la distance courante
                if (Math.max(dx, dy) === radius && QRMatrix[y][x] === "1") {
                    const px = offset + x * moduleSize;
                    const py = offset + y * moduleSize;
                    const s  = moduleSize;

                    ctx.fillStyle = "#000000";

                    switch (style) {
                        case 0: //CUBE 5
                            ctx.fillRect(px, py, s, s);
                            break;
                        case 1: //CIRCLE 4
                            ctx.beginPath();
                            ctx.arc(px + s/2, py + s/2, s/2, 0, Math.PI * 2);
                            ctx.fill();
                            break;
                        case 2: //CUBE ROUNDED 5
                            const r = s * 0.25;
                            ctx.beginPath();
                            ctx.moveTo(px + r, py);
                            ctx.lineTo(px + s - r, py);
                            ctx.quadraticCurveTo(px + s, py, px + s, py + r);
                            ctx.lineTo(px + s, py + s - r);
                            ctx.quadraticCurveTo(px + s, py + s, px + s - r, py + s);
                            ctx.lineTo(px + r, py + s);
                            ctx.quadraticCurveTo(px, py + s, px, py + s - r);
                            ctx.lineTo(px, py + r);
                            ctx.quadraticCurveTo(px, py, px + r, py);
                            ctx.fill();
                            break;
                        case 3: //DIAM 2
                            ctx.beginPath();
                            ctx.moveTo(px + s/2, py);
                            ctx.lineTo(px + s, py + s/2);
                            ctx.lineTo(px + s/2, py + s);
                            ctx.lineTo(px, py + s/2);
                            ctx.closePath();
                            ctx.fill();
                            break;
                        case 4: // HEX 4
                            const h = s / 2;
                            ctx.beginPath();
                            ctx.moveTo(px + h * 0.5, py);
                            ctx.lineTo(px + h * 1.5, py);
                            ctx.lineTo(px + s, py + h);
                            ctx.lineTo(px + h * 1.5, py + s);
                            ctx.lineTo(px + h * 0.5, py + s);
                            ctx.lineTo(px, py + h);
                            ctx.closePath();
                            ctx.fill();
                            break;
                        case 5: // HORIZ LINE 3
                            ctx.fillRect(px, py + s * 0.2, s, s * 0.6);
                            break;
                        case 6: //VERT LINE 3
                            ctx.fillRect(px + s * 0.2, py, s * 0.6, s);
                            break;
                        case 7: //CROSS
                            ctx.fillRect(px + s * 0.35, py, s * 0.3, s);
                            ctx.fillRect(px, py + s * 0.35, s, s * 0.3);
                            break;
                        case 8: //TRIANGLE
                            ctx.beginPath();
                            ctx.moveTo(px + s/2, py);
                            ctx.lineTo(px + s, py + s);
                            ctx.lineTo(px, py + s);
                            ctx.closePath();
                            ctx.fill();
                            break;
                        case 9: // DOTS 3
                            const r2 = s * 0.15;
                            const positions = [[0.3, 0.3],[0.7, 0.3],[0.3, 0.7],[0.7, 0.7]];
                            for (const [dx, dy] of positions) {
                                ctx.beginPath();
                                ctx.arc(px + s * dx, py + s * dy, r2, 0, Math.PI * 2);
                                ctx.fill();
                            }
                            break;
                        case 10: // CUTOUT (composite)
                            ctx.save();
                            ctx.fillRect(px, py, s, s);
                            ctx.globalCompositeOperation = "destination-out";
                            ctx.fillRect(
                                px + s * 0.3,
                                py + s * 0.3,
                                s * 0.4,
                                s * 0.4
                            );
                            ctx.restore();
                            break;
                        case 11: // CAPILLARITÉ FLUIDE (traits arrondis)
                            const r1 = s * 0.38;          // rayon du noyau
                            const stroke = s * 0.38;     // épaisseur des liaisons

                            const cxm = px + s / 2;
                            const cym = py + s / 2;

                            const up    = QRMatrix[y - 1]?.[x] === "1";
                            const down  = QRMatrix[y + 1]?.[x] === "1";
                            const left  = QRMatrix[y]?.[x - 1] === "1";
                            const right = QRMatrix[y]?.[x + 1] === "1";

                            // noyau central
                            ctx.beginPath();
                            ctx.arc(cxm, cym, r1, 0, Math.PI * 2);
                            ctx.fill();

                            ctx.lineWidth = stroke;
                            ctx.lineCap = "round";
                            ctx.strokeStyle = "#000";

                            // liaisons
                            if (up) {
                                ctx.beginPath();
                                ctx.moveTo(cxm, cym);
                                ctx.lineTo(cxm, py);
                                ctx.stroke();
                            }

                            if (down) {
                                ctx.beginPath();
                                ctx.moveTo(cxm, cym);
                                ctx.lineTo(cxm, py + s);
                                ctx.stroke();
                            }

                            if (left) {
                                ctx.beginPath();
                                ctx.moveTo(cxm, cym);
                                ctx.lineTo(px, cym);
                                ctx.stroke();
                            }

                            if (right) {
                                ctx.beginPath();
                                ctx.moveTo(cxm, cym);
                                ctx.lineTo(px + s, cym);
                                ctx.stroke();
                            }

                            break;
                    }
                }
            }
        }

        radius += 0.5;
        if (radius <= maxRadius) {
            requestAnimationFrame(drawRing);
        }
    }

    drawRing();
}

document.addEventListener('DOMContentLoaded', () => {
    const genBtn = document.querySelector('.gen');
    const textInput = document.getElementById('textInput');
    const recuphead = document.querySelector(".recuphead");
    const stylehead = document.querySelector(".stylehead");
    const saveBtn = document.querySelector(".saveimg");
    const canvas = document.getElementById("qrcodeCanvas");
    const notif = document.getElementById("notif");
    const notifText = notif.querySelector(".notif-text");
    const notifClose = notif.querySelector(".notif-close");

    let notifTimeout;

    function showNotif(message) {
        notifText.textContent = message;

        // reset
        clearTimeout(notifTimeout);
        notif.classList.remove("show");
        void notif.offsetWidth; // reflow

        notif.classList.add("show");

        // auto close après 3s
        notifTimeout = setTimeout(hideNotif, 3000);
    }

    function hideNotif() {
        notif.classList.remove("show");
    }

    // clic sur la croix
    notifClose.addEventListener("click", (e) => {
        e.stopPropagation();
        hideNotif();
    });

    // clic ailleurs sur la page
    document.addEventListener("click", (e) => {
        if (!notif.contains(e.target) && !genBtn.contains(e.target)) {
            hideNotif();
        }
    });

    genBtn.addEventListener('click', () => {
        const DataStr = textInput.value;
        //Level
        const selectedRecovery = document.querySelector('input[name="recovery"]:checked');
        const LevECC = selectedRecovery ? selectedRecovery.value : null;

        // Style
        const selectedStyle = document.querySelector('input[name="style"]:checked');
        const styleValue = selectedStyle ? selectedStyle.value : null;

        saveBtn.classList.remove("active");

        if (!DataStr) {
            showNotif("Veuillez entrer du texte");
            textInput.classList.remove("active");
            void textInput.offsetWidth; // reflow
            textInput.classList.add("active");
            return;
        }

        if (!LevECC) {
            showNotif("Veuillez choisir un niveau de récupération");
            recuphead.classList.remove("active");
            void recuphead.offsetWidth; // reflow
            recuphead.classList.add("active");
            return;
        }


        if (!styleValue) {
            showNotif("Veuillez choisir un style dans la grille");
            stylehead.classList.remove("active");
            void stylehead.offsetWidth; // reflow pour reset animation
            stylehead.classList.add("active");
            return;
        }

        [QRMatrix, Overflow, UnreadChar] = generateQRCode(LevECC, DataStr);

        if (Overflow) {
            showNotif("Le texte est trop long pour ce QR code");
            return;
        }

        if (!UnreadChar) {
            saveBtn.classList.add("active");
            const ctx = canvas.getContext("2d");
            drawQRCodeRevealFromCenter(ctx, QRMatrix, canvas, styleValue);
            return;
        } else {
            showNotif(UnreadChar);
            return;
        }
    });

    recuphead.addEventListener("animationend", () => {
        recuphead.classList.remove("active");
    });

    stylehead.addEventListener("animationend", () => {
        stylehead.classList.remove("active");
    });

    textInput.addEventListener("animationend", () => {
        textInput.classList.remove("active");
    });

    saveBtn.addEventListener("click", () => {
        const link = document.createElement("a");
        link.download = "QR-Code.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
});