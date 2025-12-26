// Data wilayah Tasikmalaya dan Ciamis dengan kecamatan dan desa
export const regions = {
  Tasikmalaya: {
    kecamatan: {
      "Kota Tasikmalaya": {
        desa: [
          "Cikalang",
          "Empangsari",
          "Kahuripan",
          "Mangkubumi",
          "Setiawargi",
          "Sukamajukaler",
          "Tamanjaya",
          "Tugujaya",
          "Cigeureung",
        ],
      },
      Cigalontang: {
        desa: ["Cigalontang", "Karangpakuan", "Neglasari", "Sukaherang", "Sukamaju"],
      },
      Leuwisari: {
        desa: ["Cibungur", "Girijaya", "Leuwisari", "Margaluyu", "Padahanten"],
      },
      Salawu: {
        desa: ["Cibunar", "Cilolohan", "Linggasari", "Neglasari", "Salawu"],
      },
      Singaparna: {
        desa: ["Cikunir", "Cintaraja", "Singasari", "Singaparna", "Sukamulya"],
      },
      Manonjaya: {
        desa: ["Cijeungjing", "Jamanis", "Karangmulya", "Manonjaya", "Neglasari"],
      },
      Ciawi: {
        desa: ["Ciawi", "Karyasari", "Linggawangi", "Margaluyu", "Neglawangi"],
      },
    },
  },
  Ciamis: {
    kecamatan: {
      "Kota Ciamis": {
        desa: ["Ciamis", "Imbanagara", "Kertasari", "Linggasari", "Pawindan", "Sindangrasa"],
      },
      Banjaranyar: {
        desa: ["Banjaranyar", "Bojong", "Pamalayan", "Purwasari", "Sindanghayu"],
      },
      Cipaku: {
        desa: ["Cipaku", "Karangpawitan", "Mekarjaya", "Padamulya", "Sukahurip"],
      },
      Cikoneng: {
        desa: ["Cikoneng", "Cileungsir", "Margamulya", "Padangsari", "Sindanghayu"],
      },
      Kawali: {
        desa: ["Godog", "Kawali", "Kawalimukti", "Singkup", "Winduraja"],
      },
      Panjalu: {
        desa: ["Mandalawangi", "Panjalu", "Sandingtaman", "Tanjungsari", "Sukahayu"],
      },
      Panumbangan: {
        desa: ["Bojonggedang", "Ciomas", "Panumbangan", "Sidaharja", "Winduhaji"],
      },
    },
  },
}

export type RegionData = typeof regions
export type Kabupaten = keyof RegionData
export type Kecamatan<K extends Kabupaten> = keyof RegionData[K]["kecamatan"]
export type Desa<K extends Kabupaten, Kec extends Kecamatan<K>> = RegionData[K]["kecamatan"][Kec]["desa"][number]
