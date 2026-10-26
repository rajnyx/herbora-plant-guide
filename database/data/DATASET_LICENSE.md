# 🌿 Amidha Ayurveda Herb Database v2.0 — Dataset License & Attribution

This directory contains `herb.json`, a curated open-source dataset of **360 Ayurvedic medicinal plant records** integrated into the Herbora platform.

---

## 📜 License Information

The **Amidha Ayurveda Herb Database v2.0** is licensed under the **Creative Commons Attribution 4.0 International License (CC BY 4.0)**.

To view a copy of this license, visit:  
[https://creativecommons.org/licenses/by/4.0/](https://creativecommons.org/licenses/by/4.0/)

---

## 🏷️ Attribution & Citation

As required by Section 3(a) of the CC BY 4.0 license:

* **Creator**: **Sparsh Varshney**
* **Affiliation**: Amidha Ayurveda & Uttarakhand Ayurved University
* **ORCID**: [0009-0004-7835-0673](https://orcid.org/0009-0004-7835-0673)
* **Dataset Monograph Portal**: [https://www.amidhaayurveda.com/p/herb-database.html](https://www.amidhaayurveda.com/p/herb-database.html)
* **Original GitHub Repository**: [https://github.com/sciencewithsaucee-sudo/herb-database](https://github.com/sciencewithsaucee-sudo/herb-database)
* **Zenodo DOI**: [10.5281/zenodo.17475351](https://doi.org/10.5281/zenodo.17475351)

### Formal Citation
```bibtex
@dataset{varshney_2026_amidha,
  author       = {Varshney, Sparsh},
  title        = {Amidha Ayurveda Herb Database v2.0: An open-source, citable dataset of Ayurvedic medicinal plants},
  year         = {2026},
  publisher    = {Zenodo},
  doi          = {10.5281/zenodo.17475351},
  url          = {https://doi.org/10.5281/zenodo.17475351}
}
```

---

## 📝 Modification Notice

* **Redistribution Status**: The file `herb.json` in this directory is redistributed in its authentic, canonical JSON format containing all 360 botanical entries and 18 original fields.
* **Application Usage**: Inside Herbora, the dataset records are mapped via `backend/import_dataset.py` into Herbora's database schema (`plants` table) with normalized taxonomy, categorized into Herbora's 7 wellness categories, and linked with classical Samhita references.
