# Model Comparison

- **Evaluation partition:** test
- **Primary ranking metric:** f1_score
- **Selected best model:** DecisionTree

| Rank | Model | accuracy | precision | recall | f1_score | roc_auc | pr_auc | log_loss | Training (s) | Prediction (s) | Model size (bytes) | Parameters |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | DecisionTree | 0.992829 | 0.993246 | 0.992829 | 0.993026 | 0.762765 | 0.996775 | 0.237427 | 7.289179 | 1.286782 | 40627 | 3969 |
| 2 | RandomForest | 0.993227 | 0.991846 | 0.993227 | 0.992354 | 0.931084 | 0.999107 | 0.044107 | 8.252577 | 1.303971 | 4112387 | 457704 |
| 3 | XGBoost | 0.993227 | 0.990864 | 0.993227 | 0.991388 | 0.978127 | 0.999838 | 0.021234 | 7.002964 | 1.625889 | 210579 | 15136 |
| 4 | LogisticRegression | 0.993227 | 0.986500 | 0.993227 | 0.989852 | 0.971874 | 0.999796 | 0.022698 | 22.283655 | 1.395233 | 5849 | 115 |

## Configurations

### 1. DecisionTree

```json
{
  "ccp_alpha": 0.0,
  "class_weight": null,
  "criterion": "gini",
  "max_depth": null,
  "max_features": null,
  "min_samples_leaf": 1,
  "min_samples_split": 2,
  "random_state": 42
}
```

### 2. RandomForest

```json
{
  "bootstrap": true,
  "class_weight": null,
  "criterion": "gini",
  "max_depth": null,
  "max_features": "sqrt",
  "min_samples_leaf": 1,
  "min_samples_split": 2,
  "n_estimators": 100,
  "n_jobs": null,
  "oob_score": false,
  "random_state": 42
}
```

### 3. XGBoost

```json
{
  "colsample_bytree": 1.0,
  "eval_metric": null,
  "gamma": 0.0,
  "learning_rate": 0.1,
  "max_depth": 6,
  "min_child_weight": 1.0,
  "n_estimators": 100,
  "n_jobs": null,
  "objective": "auto",
  "random_state": 42,
  "reg_alpha": 0.0,
  "reg_lambda": 1.0,
  "resolved_objective": "binary:logistic",
  "subsample": 1.0,
  "xgboost_version": "3.4.1"
}
```

### 4. LogisticRegression

```json
{
  "C": 1.0,
  "class_weight": null,
  "max_iter": 1000,
  "multi_class": "auto",
  "penalty": "l2",
  "random_state": 42,
  "solver": "lbfgs"
}
```
