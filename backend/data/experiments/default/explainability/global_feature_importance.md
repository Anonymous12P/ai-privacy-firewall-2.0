# Global SHAP Feature Importance

- **Model:** XGBoost
- **Explainer:** SHAP
- **Samples explained:** 5020

| Rank | Feature | Mean |SHAP| | Mean SHAP | Std Dev | Contribution (%) | Positive | Negative |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | indicator.usb | 1.528223608 | 1.119292781 | 1.125963145 | 32.86967604 | 4003 | 1017 |
| 2 | behavioral_risk_index | 0.5125735063 | 0.2200385702 | 0.5378821078 | 11.02464653 | 3248 | 1772 |
| 3 | indicator.session | 0.4842746823 | 0.403657289 | 0.5141828519 | 10.41598353 | 4056 | 964 |
| 4 | indicator.login | 0.3811053333 | 0.19889788 | 0.4930319386 | 8.19697378 | 2085 | 2935 |
| 5 | categorical.subject_id==PSF0133 | 0.330953409 | 0.3045701935 | 0.2454437112 | 7.118285102 | 4993 | 27 |
| 6 | indicator.email | 0.3236872165 | -0.01031942715 | 0.4033768023 | 6.962000777 | 2961 | 2059 |
| 7 | categorical.subject_id==IKR0401 | 0.2211521582 | 0.1904402524 | 0.1883633485 | 4.756633623 | 4974 | 46 |
| 8 | component_score.session | 0.2204003863 | 0.08914650727 | 0.2988740193 | 4.740464197 | 1474 | 3546 |
| 9 | categorical.subject_id==NWT0098 | 0.2068499691 | 0.1753045799 | 0.2014148684 | 4.449016126 | 4969 | 51 |
| 10 | categorical.subject_id==MOS0047 | 0.1667760689 | 0.1493727194 | 0.1751932899 | 3.587089826 | 4991 | 29 |
| 11 | categorical.subject_id==EHD0584 | 0.1349266119 | 0.09532068745 | 0.260640809 | 2.902058311 | 4987 | 33 |
| 12 | categorical.subject_id==FSC0601 | 0.04456211382 | 0.03471280169 | 0.05945248152 | 0.9584606845 | 4958 | 62 |
| 13 | categorical.subject_id==MTB0620 | 0.02382803312 | -0.0005668727232 | 0.111659728 | 0.5125033571 | 56 | 4964 |
| 14 | indicator.file | 0.02304833982 | -0.005441974441 | 0.04043740853 | 0.4957333856 | 387 | 4633 |
| 15 | categorical.subject_id==EIS0041 | 0.01797055531 | -0.003896863548 | 0.07448302952 | 0.386518261 | 51 | 4969 |
| 16 | categorical.subject_id==CWR0502 | 0.01035223077 | 0.0006842901386 | 0.05177767412 | 0.222660133 | 59 | 4961 |
| 17 | categorical.subject_id==MBJ0312 | 0.006596167106 | -0.0007741796303 | 0.03194904896 | 0.1418731361 | 43 | 4977 |
| 18 | categorical.subject_id==QJR0688 | 0.003732327516 | -0.0001150762647 | 0.01791865208 | 0.08027646984 | 60 | 4960 |
| 19 | categorical.subject_id==LBH0942 | 0.003511708862 | -0.001281263958 | 0.0116699551 | 0.07553131103 | 63 | 4957 |
| 20 | categorical.subject_id==HVF0067 | 0.003246494718 | -0.0004339408885 | 0.0151747226 | 0.06982697369 | 48 | 4972 |
| 21 | categorical.subject_id==BVC0790 | 0.001570940114 | -0.0003299065774 | 0.006703414079 | 0.03378844062 | 63 | 4957 |
| 22 | categorical.subject_id==AAS0442 | 0 | 0 | 0 | 0 | 0 | 0 |
| 23 | categorical.subject_id==AHM0410 | 0 | 0 | 0 | 0 | 0 | 0 |
| 24 | categorical.subject_id==AIH0675 | 0 | 0 | 0 | 0 | 0 | 0 |
| 25 | categorical.subject_id==AIP0982 | 0 | 0 | 0 | 0 | 0 | 0 |
| 26 | categorical.subject_id==AJC0840 | 0 | 0 | 0 | 0 | 0 | 0 |
| 27 | categorical.subject_id==AKK0329 | 0 | 0 | 0 | 0 | 0 | 0 |
| 28 | categorical.subject_id==AKW0167 | 0 | 0 | 0 | 0 | 0 | 0 |
| 29 | categorical.subject_id==ARB0881 | 0 | 0 | 0 | 0 | 0 | 0 |
| 30 | categorical.subject_id==ASS0206 | 0 | 0 | 0 | 0 | 0 | 0 |
| 31 | categorical.subject_id==ASS0517 | 0 | 0 | 0 | 0 | 0 | 0 |
| 32 | categorical.subject_id==BAJ0654 | 0 | 0 | 0 | 0 | 0 | 0 |
| 33 | categorical.subject_id==BBG0325 | 0 | 0 | 0 | 0 | 0 | 0 |
| 34 | categorical.subject_id==BBH0810 | 0 | 0 | 0 | 0 | 0 | 0 |
| 35 | categorical.subject_id==BCM0653 | 0 | 0 | 0 | 0 | 0 | 0 |
| 36 | categorical.subject_id==BDV0168 | 0 | 0 | 0 | 0 | 0 | 0 |
| 37 | categorical.subject_id==BEC0505 | 0 | 0 | 0 | 0 | 0 | 0 |
| 38 | categorical.subject_id==BJP0134 | 0 | 0 | 0 | 0 | 0 | 0 |
| 39 | categorical.subject_id==BQS0525 | 0 | 0 | 0 | 0 | 0 | 0 |
| 40 | categorical.subject_id==CBG0490 | 0 | 0 | 0 | 0 | 0 | 0 |
| 41 | categorical.subject_id==CCH0685 | 0 | 0 | 0 | 0 | 0 | 0 |
| 42 | categorical.subject_id==CCM0467 | 0 | 0 | 0 | 0 | 0 | 0 |
| 43 | categorical.subject_id==CKD0680 | 0 | 0 | 0 | 0 | 0 | 0 |
| 44 | categorical.subject_id==CLS0296 | 0 | 0 | 0 | 0 | 0 | 0 |
| 45 | categorical.subject_id==CQH0701 | 0 | 0 | 0 | 0 | 0 | 0 |
| 46 | categorical.subject_id==CRP0456 | 0 | 0 | 0 | 0 | 0 | 0 |
| 47 | categorical.subject_id==CSH0626 | 0 | 0 | 0 | 0 | 0 | 0 |
| 48 | categorical.subject_id==CSL0949 | 0 | 0 | 0 | 0 | 0 | 0 |
| 49 | categorical.subject_id==CTR0341 | 0 | 0 | 0 | 0 | 0 | 0 |
| 50 | categorical.subject_id==DAR0885 | 0 | 0 | 0 | 0 | 0 | 0 |
| 51 | categorical.subject_id==DGF0443 | 0 | 0 | 0 | 0 | 0 | 0 |
| 52 | categorical.subject_id==DOL0332 | 0 | 0 | 0 | 0 | 0 | 0 |
| 53 | categorical.subject_id==DVW0103 | 0 | 0 | 0 | 0 | 0 | 0 |
| 54 | categorical.subject_id==EBC0390 | 0 | 0 | 0 | 0 | 0 | 0 |
| 55 | categorical.subject_id==FXF0957 | 0 | 0 | 0 | 0 | 0 | 0 |
| 56 | categorical.subject_id==GCC0744 | 0 | 0 | 0 | 0 | 0 | 0 |
| 57 | categorical.subject_id==GJT0386 | 0 | 0 | 0 | 0 | 0 | 0 |
| 58 | categorical.subject_id==GNS0178 | 0 | 0 | 0 | 0 | 0 | 0 |
| 59 | categorical.subject_id==GQF0659 | 0 | 0 | 0 | 0 | 0 | 0 |
| 60 | categorical.subject_id==GRM0868 | 0 | 0 | 0 | 0 | 0 | 0 |
| 61 | categorical.subject_id==HAC0282 | 0 | 0 | 0 | 0 | 0 | 0 |
| 62 | categorical.subject_id==HCC0344 | 0 | 0 | 0 | 0 | 0 | 0 |
| 63 | categorical.subject_id==HCL0651 | 0 | 0 | 0 | 0 | 0 | 0 |
| 64 | categorical.subject_id==HTF0641 | 0 | 0 | 0 | 0 | 0 | 0 |
| 65 | categorical.subject_id==IMB0481 | 0 | 0 | 0 | 0 | 0 | 0 |
| 66 | categorical.subject_id==IUY0279 | 0 | 0 | 0 | 0 | 0 | 0 |
| 67 | categorical.subject_id==JNJ0556 | 0 | 0 | 0 | 0 | 0 | 0 |
| 68 | categorical.subject_id==KES0729 | 0 | 0 | 0 | 0 | 0 | 0 |
| 69 | categorical.subject_id==KKS0119 | 0 | 0 | 0 | 0 | 0 | 0 |
| 70 | categorical.subject_id==KNB0022 | 0 | 0 | 0 | 0 | 0 | 0 |
| 71 | categorical.subject_id==KRL0062 | 0 | 0 | 0 | 0 | 0 | 0 |
| 72 | categorical.subject_id==LHL0309 | 0 | 0 | 0 | 0 | 0 | 0 |
| 73 | categorical.subject_id==LHN0151 | 0 | 0 | 0 | 0 | 0 | 0 |
| 74 | categorical.subject_id==LPC0492 | 0 | 0 | 0 | 0 | 0 | 0 |
| 75 | categorical.subject_id==LQC0479 | 0 | 0 | 0 | 0 | 0 | 0 |
| 76 | categorical.subject_id==MDH0686 | 0 | 0 | 0 | 0 | 0 | 0 |
| 77 | categorical.subject_id==MHG0244 | 0 | 0 | 0 | 0 | 0 | 0 |
| 78 | categorical.subject_id==MIC0726 | 0 | 0 | 0 | 0 | 0 | 0 |
| 79 | categorical.subject_id==MLD0755 | 0 | 0 | 0 | 0 | 0 | 0 |
| 80 | categorical.subject_id==NAB0801 | 0 | 0 | 0 | 0 | 0 | 0 |
| 81 | categorical.subject_id==NKH0807 | 0 | 0 | 0 | 0 | 0 | 0 |
| 82 | categorical.subject_id==NMB0972 | 0 | 0 | 0 | 0 | 0 | 0 |
| 83 | categorical.subject_id==NMG0766 | 0 | 0 | 0 | 0 | 0 | 0 |
| 84 | categorical.subject_id==ONW0083 | 0 | 0 | 0 | 0 | 0 | 0 |
| 85 | categorical.subject_id==PAD0773 | 0 | 0 | 0 | 0 | 0 | 0 |
| 86 | categorical.subject_id==PES0085 | 0 | 0 | 0 | 0 | 0 | 0 |
| 87 | categorical.subject_id==PEV0323 | 0 | 0 | 0 | 0 | 0 | 0 |
| 88 | categorical.subject_id==RAM0447 | 0 | 0 | 0 | 0 | 0 | 0 |
| 89 | categorical.subject_id==RRP0568 | 0 | 0 | 0 | 0 | 0 | 0 |
| 90 | categorical.subject_id==RSC0089 | 0 | 0 | 0 | 0 | 0 | 0 |
| 91 | categorical.subject_id==RTO0313 | 0 | 0 | 0 | 0 | 0 | 0 |
| 92 | categorical.subject_id==SCB0534 | 0 | 0 | 0 | 0 | 0 | 0 |
| 93 | categorical.subject_id==SDO0170 | 0 | 0 | 0 | 0 | 0 | 0 |
| 94 | categorical.subject_id==SJF0094 | 0 | 0 | 0 | 0 | 0 | 0 |
| 95 | categorical.subject_id==SMH0291 | 0 | 0 | 0 | 0 | 0 | 0 |
| 96 | categorical.subject_id==SOF0808 | 0 | 0 | 0 | 0 | 0 | 0 |
| 97 | categorical.subject_id==SSG0250 | 0 | 0 | 0 | 0 | 0 | 0 |
| 98 | categorical.subject_id==SSR0278 | 0 | 0 | 0 | 0 | 0 | 0 |
| 99 | categorical.subject_id==TET0621 | 0 | 0 | 0 | 0 | 0 | 0 |
| 100 | categorical.subject_id==TLH0648 | 0 | 0 | 0 | 0 | 0 | 0 |
| 101 | categorical.subject_id==VMJ0147 | 0 | 0 | 0 | 0 | 0 | 0 |
| 102 | categorical.subject_id==WBC0192 | 0 | 0 | 0 | 0 | 0 | 0 |
| 103 | categorical.subject_id==WKD0013 | 0 | 0 | 0 | 0 | 0 | 0 |
| 104 | categorical.subject_id==XHG0902 | 0 | 0 | 0 | 0 | 0 | 0 |
| 105 | categorical.subject_id==YCE0983 | 0 | 0 | 0 | 0 | 0 | 0 |
| 106 | categorical.subject_id==YIC0195 | 0 | 0 | 0 | 0 | 0 | 0 |
| 107 | categorical.subject_id==ZCF0590 | 0 | 0 | 0 | 0 | 0 | 0 |
| 108 | categorical.window==daily | 0 | 0 | 0 | 0 | 0 | 0 |
| 109 | component_score.email | 0 | 0 | 0 | 0 | 0 | 0 |
| 110 | component_score.file | 0 | 0 | 0 | 0 | 0 | 0 |
| 111 | component_score.http | 0 | 0 | 0 | 0 | 0 | 0 |
| 112 | component_score.login | 0 | 0 | 0 | 0 | 0 | 0 |
| 113 | component_score.usb | 0 | 0 | 0 | 0 | 0 | 0 |
| 114 | indicator.http | 0 | 0 | 0 | 0 | 0 | 0 |

## Metadata

```json
{
  "execution_time_seconds": 1.0456219000043347,
  "explainer_type": "TreeExplainer",
  "feature_count": 114,
  "model_type": "XGBoost",
  "reports": {
    "csv": "C:\\Users\\pj211\\OneDrive\\Desktop\\AI Privacy Firewall\\backend\\data\\experiments\\default\\explainability\\global_feature_importance.csv",
    "json": "C:\\Users\\pj211\\OneDrive\\Desktop\\AI Privacy Firewall\\backend\\data\\experiments\\default\\explainability\\global_feature_importance.json",
    "markdown": "C:\\Users\\pj211\\OneDrive\\Desktop\\AI Privacy Firewall\\backend\\data\\experiments\\default\\explainability\\global_feature_importance.md"
  },
  "sample_count": 5020,
  "shap_version": "0.54.1",
  "timestamp": "2026-11-01T18:41:15.207893+00:00"
}
```
