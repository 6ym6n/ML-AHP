import numpy as np
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.svm import SVR
from sklearn.tree import DecisionTreeRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

class SupplierAnalysisAPIView(APIView):
    def get(self, request, format=None):
        file_url = "./Dataset.xlsx"

        try:
            # Load the Excel file
            df = pd.read_excel(file_url)
        except Exception as e:
            return Response(
                {"error": f"Error loading Excel file: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Select features (X) and target (y)
        X = df.drop(['supplier', 'score'], axis=1)
        y = df['score']

        # Normalize the data
        scaler = MinMaxScaler()
        X_scaled = scaler.fit_transform(X)

        # Split data into training and testing sets
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

        def train_and_evaluate_model(model, model_name):
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            return model, mse, r2

        models = {
            "Random Forest": RandomForestRegressor(random_state=42),
            "Gradient Boosting": GradientBoostingRegressor(random_state=42),
            "Linear Regression": LinearRegression(),
            "Support Vector Regressor": SVR(),
            "Decision Tree": DecisionTreeRegressor(random_state=42),
            "Neural Network": MLPRegressor(random_state=42, max_iter=1000)
        }

        results = {}
        for model_name, model in models.items():
            trained_model, mse, r2 = train_and_evaluate_model(model, model_name)
            results[model_name] = {
                "model": trained_model,
                "mse": mse,
                "r2": r2
            }

        best_model_name = max(results, key=lambda x: results[x]['r2'])
        best_model = results[best_model_name]['model']

        features = X.columns
        feature_importances = (
            best_model.feature_importances_ if hasattr(best_model, 'feature_importances_') else np.abs(best_model.coef_)
            if hasattr(best_model, 'coef_') else np.ones(len(features))
        )

        # Assign random AHP scale values to the feature importances
        ahp_scale = [1/9, 1/8, 1/7, 1/6, 1/5, 1/4, 1/3, 1/2, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        feature_importances = np.random.choice(ahp_scale, len(features))

        importance_df = pd.DataFrame({'Criterion': features, 'Importance': feature_importances})

        def ahp_scale(value):
            scale = [1/9, 1/8, 1/7, 1/6, 1/5, 1/4, 1/3, 1/2, 1, 2, 3, 4, 5, 6, 7, 8, 9]
            closest = min(scale, key=lambda x: abs(x - value))
            return closest

        def generate_ahp_matrix(priorities):
            def calculate_lambda_max(matrix, priorities):
                weighted_sum = matrix.dot(priorities)
                return (weighted_sum / priorities).mean()

            def calculate_consistency(matrix, priorities):
                n = matrix.shape[0]
                lambda_max = calculate_lambda_max(matrix, priorities)
                IC = (lambda_max - n) / (n - 1)
                IA = {1: 0.00, 2: 0.00, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49}
                RI = IA.get(n, 1.49)  # Default to 1.49 if n > 10
                CR = IC / RI if RI != 0 else 0
                return IC, CR

            n = len(priorities)
            ahp_values = [1/9, 1/8, 1/7, 1/6, 1/5, 1/4, 1/3, 1/2, 1, 2, 3, 4, 5, 6, 7, 8, 9]
            while True:
                matrix = np.zeros((n, n))
                for i in range(n):
                    for j in range(n):
                        if i == j:
                            matrix[i, j] = 1
                        elif i < j:
                            matrix[i, j] = np.random.choice(ahp_values)
                        else:
                            matrix[i, j] = round(1 / matrix[j, i], 2)

                # Calculate priorities
                column_sums = matrix.sum(axis=0)
                normalized_matrix = matrix / column_sums
                priorities = normalized_matrix.mean(axis=1)

                # Calculate consistency
                IC, CR = calculate_consistency(matrix, priorities)
                if IC < 0.1:  # Stop if IC is less than 0.1
                    break

            return matrix

        priorities = importance_df['Importance'].values
        consistent_matrix = generate_ahp_matrix(priorities)
        consistent_matrix_df = pd.DataFrame(consistent_matrix, index=features, columns=features)

        def calculate_priorities(matrix):
            column_sums = matrix.sum(axis=0)
            normalized_matrix = matrix / column_sums
            return normalized_matrix.mean(axis=1)

        def calculate_lambda_max(matrix, priorities):
            weighted_sum = matrix.dot(priorities)
            return (weighted_sum / priorities).mean()

        def calculate_consistency(matrix, priorities):
            n = matrix.shape[0]
            lambda_max = calculate_lambda_max(matrix, priorities)
            IC = (lambda_max - n) / (n - 1)
            IA = {1: 0.00, 2: 0.00, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49}
            RI = IA.get(n)
            CR = IC / RI if RI != 0 else 0
            return IC, CR

        priorities = calculate_priorities(consistent_matrix_df)
        IC, CR = calculate_consistency(consistent_matrix_df, priorities)

        response_data = {
            "best_model": best_model_name,
            "priorities": priorities.tolist(),
            "matrix": consistent_matrix_df.to_dict(),
            "consistency": {"IC": IC, "CR": CR}
        }

        return Response(response_data, status=status.HTTP_200_OK)
