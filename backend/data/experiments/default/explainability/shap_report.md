# SHAP Report

- **Model:** XGBoost
- **Explainer:** SHAP
- **Dataset:** {'sample_count': 5020, 'feature_count': 114, 'feature_names': ('categorical.subject_id==AAS0442', 'categorical.subject_id==AHM0410', 'categorical.subject_id==AIH0675', 'categorical.subject_id==AIP0982', 'categorical.subject_id==AJC0840', 'categorical.subject_id==AKK0329', 'categorical.subject_id==AKW0167', 'categorical.subject_id==ARB0881', 'categorical.subject_id==ASS0206', 'categorical.subject_id==ASS0517', 'categorical.subject_id==BAJ0654', 'categorical.subject_id==BBG0325', 'categorical.subject_id==BBH0810', 'categorical.subject_id==BCM0653', 'categorical.subject_id==BDV0168', 'categorical.subject_id==BEC0505', 'categorical.subject_id==BJP0134', 'categorical.subject_id==BQS0525', 'categorical.subject_id==BVC0790', 'categorical.subject_id==CBG0490', 'categorical.subject_id==CCH0685', 'categorical.subject_id==CCM0467', 'categorical.subject_id==CKD0680', 'categorical.subject_id==CLS0296', 'categorical.subject_id==CQH0701', 'categorical.subject_id==CRP0456', 'categorical.subject_id==CSH0626', 'categorical.subject_id==CSL0949', 'categorical.subject_id==CTR0341', 'categorical.subject_id==CWR0502', 'categorical.subject_id==DAR0885', 'categorical.subject_id==DGF0443', 'categorical.subject_id==DOL0332', 'categorical.subject_id==DVW0103', 'categorical.subject_id==EBC0390', 'categorical.subject_id==EHD0584', 'categorical.subject_id==EIS0041', 'categorical.subject_id==FSC0601', 'categorical.subject_id==FXF0957', 'categorical.subject_id==GCC0744', 'categorical.subject_id==GJT0386', 'categorical.subject_id==GNS0178', 'categorical.subject_id==GQF0659', 'categorical.subject_id==GRM0868', 'categorical.subject_id==HAC0282', 'categorical.subject_id==HCC0344', 'categorical.subject_id==HCL0651', 'categorical.subject_id==HTF0641', 'categorical.subject_id==HVF0067', 'categorical.subject_id==IKR0401', 'categorical.subject_id==IMB0481', 'categorical.subject_id==IUY0279', 'categorical.subject_id==JNJ0556', 'categorical.subject_id==KES0729', 'categorical.subject_id==KKS0119', 'categorical.subject_id==KNB0022', 'categorical.subject_id==KRL0062', 'categorical.subject_id==LBH0942', 'categorical.subject_id==LHL0309', 'categorical.subject_id==LHN0151', 'categorical.subject_id==LPC0492', 'categorical.subject_id==LQC0479', 'categorical.subject_id==MBJ0312', 'categorical.subject_id==MDH0686', 'categorical.subject_id==MHG0244', 'categorical.subject_id==MIC0726', 'categorical.subject_id==MLD0755', 'categorical.subject_id==MOS0047', 'categorical.subject_id==MTB0620', 'categorical.subject_id==NAB0801', 'categorical.subject_id==NKH0807', 'categorical.subject_id==NMB0972', 'categorical.subject_id==NMG0766', 'categorical.subject_id==NWT0098', 'categorical.subject_id==ONW0083', 'categorical.subject_id==PAD0773', 'categorical.subject_id==PES0085', 'categorical.subject_id==PEV0323', 'categorical.subject_id==PSF0133', 'categorical.subject_id==QJR0688', 'categorical.subject_id==RAM0447', 'categorical.subject_id==RRP0568', 'categorical.subject_id==RSC0089', 'categorical.subject_id==RTO0313', 'categorical.subject_id==SCB0534', 'categorical.subject_id==SDO0170', 'categorical.subject_id==SJF0094', 'categorical.subject_id==SMH0291', 'categorical.subject_id==SOF0808', 'categorical.subject_id==SSG0250', 'categorical.subject_id==SSR0278', 'categorical.subject_id==TET0621', 'categorical.subject_id==TLH0648', 'categorical.subject_id==VMJ0147', 'categorical.subject_id==WBC0192', 'categorical.subject_id==WKD0013', 'categorical.subject_id==XHG0902', 'categorical.subject_id==YCE0983', 'categorical.subject_id==YIC0195', 'categorical.subject_id==ZCF0590', 'categorical.window==daily', 'indicator.email', 'indicator.file', 'indicator.http', 'indicator.login', 'indicator.session', 'indicator.usb', 'component_score.email', 'component_score.file', 'component_score.http', 'component_score.login', 'component_score.session', 'component_score.usb', 'behavioral_risk_index')}

## Global Feature Importance

| Rank | Feature | Mean absolute SHAP | Contribution (%) |
| --- | --- | --- | --- |
| 1 | indicator.usb | 1.528223607695079 | 32.86967604233631 |
| 2 | behavioral_risk_index | 0.5125735063286706 | 11.024646534755972 |
| 3 | indicator.session | 0.4842746823236942 | 10.415983527105158 |
| 4 | indicator.login | 0.38110533325869844 | 8.196973779978057 |
| 5 | categorical.subject_id==PSF0133 | 0.3309534090211192 | 7.118285102294747 |
| 6 | indicator.email | 0.3236872164716673 | 6.962000777174325 |
| 7 | categorical.subject_id==IKR0401 | 0.22115215820397632 | 4.7566336232639905 |
| 8 | component_score.session | 0.22040038630310668 | 4.740464197065565 |
| 9 | categorical.subject_id==NWT0098 | 0.20684996914815165 | 4.449016126325673 |
| 10 | categorical.subject_id==MOS0047 | 0.1667760688648281 | 3.587089826121211 |
| 11 | categorical.subject_id==EHD0584 | 0.13492661187521726 | 2.9020583110330653 |
| 12 | categorical.subject_id==FSC0601 | 0.04456211382345077 | 0.9584606845249038 |
| 13 | categorical.subject_id==MTB0620 | 0.02382803311779264 | 0.5125033570769035 |
| 14 | indicator.file | 0.023048339815904477 | 0.495733385643144 |
| 15 | categorical.subject_id==EIS0041 | 0.017970555305686888 | 0.38651826095639896 |
| 16 | categorical.subject_id==CWR0502 | 0.010352230772786065 | 0.22266013304832846 |
| 17 | categorical.subject_id==MBJ0312 | 0.006596167106274144 | 0.14187313611216387 |
| 18 | categorical.subject_id==QJR0688 | 0.003732327516473629 | 0.08027646983900265 |
| 19 | categorical.subject_id==LBH0942 | 0.0035117088615304356 | 0.07553131102823414 |
| 20 | categorical.subject_id==HVF0067 | 0.0032464947179516412 | 0.06982697369344536 |
| 21 | categorical.subject_id==BVC0790 | 0.0015709401139631437 | 0.033788440623397455 |
| 22 | categorical.subject_id==AAS0442 | 0.0 | 0.0 |
| 23 | categorical.subject_id==AHM0410 | 0.0 | 0.0 |
| 24 | categorical.subject_id==AIH0675 | 0.0 | 0.0 |
| 25 | categorical.subject_id==AIP0982 | 0.0 | 0.0 |
| 26 | categorical.subject_id==AJC0840 | 0.0 | 0.0 |
| 27 | categorical.subject_id==AKK0329 | 0.0 | 0.0 |
| 28 | categorical.subject_id==AKW0167 | 0.0 | 0.0 |
| 29 | categorical.subject_id==ARB0881 | 0.0 | 0.0 |
| 30 | categorical.subject_id==ASS0206 | 0.0 | 0.0 |
| 31 | categorical.subject_id==ASS0517 | 0.0 | 0.0 |
| 32 | categorical.subject_id==BAJ0654 | 0.0 | 0.0 |
| 33 | categorical.subject_id==BBG0325 | 0.0 | 0.0 |
| 34 | categorical.subject_id==BBH0810 | 0.0 | 0.0 |
| 35 | categorical.subject_id==BCM0653 | 0.0 | 0.0 |
| 36 | categorical.subject_id==BDV0168 | 0.0 | 0.0 |
| 37 | categorical.subject_id==BEC0505 | 0.0 | 0.0 |
| 38 | categorical.subject_id==BJP0134 | 0.0 | 0.0 |
| 39 | categorical.subject_id==BQS0525 | 0.0 | 0.0 |
| 40 | categorical.subject_id==CBG0490 | 0.0 | 0.0 |
| 41 | categorical.subject_id==CCH0685 | 0.0 | 0.0 |
| 42 | categorical.subject_id==CCM0467 | 0.0 | 0.0 |
| 43 | categorical.subject_id==CKD0680 | 0.0 | 0.0 |
| 44 | categorical.subject_id==CLS0296 | 0.0 | 0.0 |
| 45 | categorical.subject_id==CQH0701 | 0.0 | 0.0 |
| 46 | categorical.subject_id==CRP0456 | 0.0 | 0.0 |
| 47 | categorical.subject_id==CSH0626 | 0.0 | 0.0 |
| 48 | categorical.subject_id==CSL0949 | 0.0 | 0.0 |
| 49 | categorical.subject_id==CTR0341 | 0.0 | 0.0 |
| 50 | categorical.subject_id==DAR0885 | 0.0 | 0.0 |
| 51 | categorical.subject_id==DGF0443 | 0.0 | 0.0 |
| 52 | categorical.subject_id==DOL0332 | 0.0 | 0.0 |
| 53 | categorical.subject_id==DVW0103 | 0.0 | 0.0 |
| 54 | categorical.subject_id==EBC0390 | 0.0 | 0.0 |
| 55 | categorical.subject_id==FXF0957 | 0.0 | 0.0 |
| 56 | categorical.subject_id==GCC0744 | 0.0 | 0.0 |
| 57 | categorical.subject_id==GJT0386 | 0.0 | 0.0 |
| 58 | categorical.subject_id==GNS0178 | 0.0 | 0.0 |
| 59 | categorical.subject_id==GQF0659 | 0.0 | 0.0 |
| 60 | categorical.subject_id==GRM0868 | 0.0 | 0.0 |
| 61 | categorical.subject_id==HAC0282 | 0.0 | 0.0 |
| 62 | categorical.subject_id==HCC0344 | 0.0 | 0.0 |
| 63 | categorical.subject_id==HCL0651 | 0.0 | 0.0 |
| 64 | categorical.subject_id==HTF0641 | 0.0 | 0.0 |
| 65 | categorical.subject_id==IMB0481 | 0.0 | 0.0 |
| 66 | categorical.subject_id==IUY0279 | 0.0 | 0.0 |
| 67 | categorical.subject_id==JNJ0556 | 0.0 | 0.0 |
| 68 | categorical.subject_id==KES0729 | 0.0 | 0.0 |
| 69 | categorical.subject_id==KKS0119 | 0.0 | 0.0 |
| 70 | categorical.subject_id==KNB0022 | 0.0 | 0.0 |
| 71 | categorical.subject_id==KRL0062 | 0.0 | 0.0 |
| 72 | categorical.subject_id==LHL0309 | 0.0 | 0.0 |
| 73 | categorical.subject_id==LHN0151 | 0.0 | 0.0 |
| 74 | categorical.subject_id==LPC0492 | 0.0 | 0.0 |
| 75 | categorical.subject_id==LQC0479 | 0.0 | 0.0 |
| 76 | categorical.subject_id==MDH0686 | 0.0 | 0.0 |
| 77 | categorical.subject_id==MHG0244 | 0.0 | 0.0 |
| 78 | categorical.subject_id==MIC0726 | 0.0 | 0.0 |
| 79 | categorical.subject_id==MLD0755 | 0.0 | 0.0 |
| 80 | categorical.subject_id==NAB0801 | 0.0 | 0.0 |
| 81 | categorical.subject_id==NKH0807 | 0.0 | 0.0 |
| 82 | categorical.subject_id==NMB0972 | 0.0 | 0.0 |
| 83 | categorical.subject_id==NMG0766 | 0.0 | 0.0 |
| 84 | categorical.subject_id==ONW0083 | 0.0 | 0.0 |
| 85 | categorical.subject_id==PAD0773 | 0.0 | 0.0 |
| 86 | categorical.subject_id==PES0085 | 0.0 | 0.0 |
| 87 | categorical.subject_id==PEV0323 | 0.0 | 0.0 |
| 88 | categorical.subject_id==RAM0447 | 0.0 | 0.0 |
| 89 | categorical.subject_id==RRP0568 | 0.0 | 0.0 |
| 90 | categorical.subject_id==RSC0089 | 0.0 | 0.0 |
| 91 | categorical.subject_id==RTO0313 | 0.0 | 0.0 |
| 92 | categorical.subject_id==SCB0534 | 0.0 | 0.0 |
| 93 | categorical.subject_id==SDO0170 | 0.0 | 0.0 |
| 94 | categorical.subject_id==SJF0094 | 0.0 | 0.0 |
| 95 | categorical.subject_id==SMH0291 | 0.0 | 0.0 |
| 96 | categorical.subject_id==SOF0808 | 0.0 | 0.0 |
| 97 | categorical.subject_id==SSG0250 | 0.0 | 0.0 |
| 98 | categorical.subject_id==SSR0278 | 0.0 | 0.0 |
| 99 | categorical.subject_id==TET0621 | 0.0 | 0.0 |
| 100 | categorical.subject_id==TLH0648 | 0.0 | 0.0 |
| 101 | categorical.subject_id==VMJ0147 | 0.0 | 0.0 |
| 102 | categorical.subject_id==WBC0192 | 0.0 | 0.0 |
| 103 | categorical.subject_id==WKD0013 | 0.0 | 0.0 |
| 104 | categorical.subject_id==XHG0902 | 0.0 | 0.0 |
| 105 | categorical.subject_id==YCE0983 | 0.0 | 0.0 |
| 106 | categorical.subject_id==YIC0195 | 0.0 | 0.0 |
| 107 | categorical.subject_id==ZCF0590 | 0.0 | 0.0 |
| 108 | categorical.window==daily | 0.0 | 0.0 |
| 109 | component_score.email | 0.0 | 0.0 |
| 110 | component_score.file | 0.0 | 0.0 |
| 111 | component_score.http | 0.0 | 0.0 |
| 112 | component_score.login | 0.0 | 0.0 |
| 113 | component_score.usb | 0.0 | 0.0 |
| 114 | indicator.http | 0.0 | 0.0 |

## Example Local Explanation

- **Sample:** 0
- **Predicted class:** normal
- **Probability:** 0.9999147653579712

## Generated Artifacts

- `C:\Users\pj211\OneDrive\Desktop\AI Privacy Firewall\backend\data\experiments\default\explainability\shap_report.json`
- `C:\Users\pj211\OneDrive\Desktop\AI Privacy Firewall\backend\data\experiments\default\explainability\shap_report.csv`
- `C:\Users\pj211\OneDrive\Desktop\AI Privacy Firewall\backend\data\experiments\default\explainability\shap_report.md`
- `C:\Users\pj211\OneDrive\Desktop\AI Privacy Firewall\backend\data\experiments\default\explainability\explainability_summary.md`
- `C:\Users\pj211\OneDrive\Desktop\AI Privacy Firewall\backend\data\experiments\default\explainability\explainability_manifest.json`

- **Generated at:** 2026-11-01T18:41:16.885444+00:00
