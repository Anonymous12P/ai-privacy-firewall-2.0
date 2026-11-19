# Explainability Summary

- **Model:** XGBoost
- **Explainer:** TreeExplainer
- **SHAP version:** 0.54.1
- **Dataset:** 5020 samples, 114 features
- **SHAP generated at:** 2026-11-01T18:41:12.908238+00:00

## Top Global Features

| Rank | Feature | Mean absolute SHAP | Contribution (%) |
| --- | --- | --- | --- |
| 1 | indicator.usb | 1.528223608 | 32.86967604 |
| 2 | behavioral_risk_index | 0.5125735063 | 11.02464653 |
| 3 | indicator.session | 0.4842746823 | 10.41598353 |
| 4 | indicator.login | 0.3811053333 | 8.19697378 |
| 5 | categorical.subject_id==PSF0133 | 0.330953409 | 7.118285102 |
| 6 | indicator.email | 0.3236872165 | 6.962000777 |
| 7 | categorical.subject_id==IKR0401 | 0.2211521582 | 4.756633623 |
| 8 | component_score.session | 0.2204003863 | 4.740464197 |
| 9 | categorical.subject_id==NWT0098 | 0.2068499691 | 4.449016126 |
| 10 | categorical.subject_id==MOS0047 | 0.1667760689 | 3.587089826 |

## Example Local Explanation

- **Sample:** 0
- **Subject:** sample-0
- **Predicted class:** normal
- **Probability:** 0.9999147653579712

## Generated Artifacts

- `C:\Users\pj211\OneDrive\Desktop\AI Privacy Firewall\backend\data\experiments\default\explainability\shap_report.json`
- `C:\Users\pj211\OneDrive\Desktop\AI Privacy Firewall\backend\data\experiments\default\explainability\shap_report.csv`
- `C:\Users\pj211\OneDrive\Desktop\AI Privacy Firewall\backend\data\experiments\default\explainability\shap_report.md`
- `C:\Users\pj211\OneDrive\Desktop\AI Privacy Firewall\backend\data\experiments\default\explainability\explainability_summary.md`
- `C:\Users\pj211\OneDrive\Desktop\AI Privacy Firewall\backend\data\experiments\default\explainability\explainability_manifest.json`

- **Summary generated at:** 2026-11-01T18:41:19.957229+00:00
