
import { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaUtensils,
  FaTimes,
  FaFire,
  FaDrumstickBite,
  FaBreadSlice,
} from "react-icons/fa";

import { authRequest } from "../../../services/api";

import "./Nutrition.css";

function Nutrition() {
  const emptyForm = {
    foodName: "",
    mealType: "Breakfast",
    date: new Date().toISOString().split("T")[0],
    quantity: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  };

  const [foods, setFoods] = useState([]);
  const [formData, setFormData] = useState(emptyForm);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  const [mealFilter, setMealFilter] = useState("All");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD NUTRITION DATA FROM BACKEND
  // =========================================================

  const loadNutrition = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authRequest("/nutrition");

      console.log("NUTRITION DATA RESPONSE:", response);

      if (response.success) {
        setFoods(
          Array.isArray(response.nutrition)
            ? response.nutrition
            : []
        );
      } else {
        setFoods([]);
      }
    } catch (error) {
      console.error("LOAD NUTRITION ERROR:", error);

      setError(
        error.message || "Failed to load nutrition records."
      );

      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNutrition();
  }, []);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================================================
  // SAVE FOOD
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.foodName.trim() || !formData.date) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const nutritionData = {
        date: formData.date,
        mealType: formData.mealType,
        foodName: formData.foodName.trim(),
        quantity: formData.quantity.trim(),
        calories: Number(formData.calories) || 0,
        protein: Number(formData.protein) || 0,
        carbs: Number(formData.carbs) || 0,
        fats: Number(formData.fats) || 0,
      };

      console.log(
        "NUTRITION DATA BEING SENT:",
        nutritionData
      );

      let response;

      if (editingId) {
        response = await authRequest(
          `/nutrition/${editingId}`,
          {
            method: "PUT",
            body: JSON.stringify(nutritionData),
          }
        );

        console.log(
          "NUTRITION UPDATE RESPONSE:",
          response
        );
      } else {
        response = await authRequest("/nutrition", {
          method: "POST",
          body: JSON.stringify(nutritionData),
        });

        console.log(
          "NUTRITION CREATE RESPONSE:",
          response
        );
      }

      if (!response.success) {
        throw new Error(
          response.message || "Failed to save nutrition record."
        );
      }

      await loadNutrition();

      window.dispatchEvent(
        new Event("fittrackNutritionUpdated")
      );

      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.error("SAVE NUTRITION ERROR:", error);

      setError(
        error.message || "Failed to save nutrition record."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (food) => {
    setFormData({
      foodName: food?.foodName || "",

      mealType: food?.mealType || "Breakfast",

      date: food?.date
        ? new Date(food.date).toISOString().split("T")[0]
        : "",

      quantity: food?.quantity || "",

      calories:
        food?.calories !== undefined
          ? food.calories
          : "",

      protein:
        food?.protein !== undefined
          ? food.protein
          : "",

      carbs:
        food?.carbs !== undefined
          ? food.carbs
          : "",

      fats:
        food?.fats !== undefined
          ? food.fats
          : "",
    });

    setEditingId(food._id);

    setShowForm(true);

    setError("");
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this nutrition record?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await authRequest(
        `/nutrition/${id}`,
        {
          method: "DELETE",
        }
      );

      console.log(
        "NUTRITION DELETE RESPONSE:",
        response
      );

      if (!response.success) {
        throw new Error(
          response.message || "Failed to delete nutrition record."
        );
      }

      await loadNutrition();

      window.dispatchEvent(
        new Event("fittrackNutritionUpdated")
      );
    } catch (error) {
      console.error("DELETE NUTRITION ERROR:", error);

      setError(
        error.message || "Failed to delete nutrition record."
      );
    }
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  // =========================================================
  // FILTER
  // =========================================================

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      const foodName = food?.foodName || "";

      const matchesSearch = foodName
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesMeal =
        mealFilter === "All" ||
        food?.mealType === mealFilter;

      return matchesSearch && matchesMeal;
    });
  }, [foods, search, mealFilter]);

  // =========================================================
  // STATS
  // =========================================================

  const totalCalories = foods.reduce(
    (total, food) =>
      total + (Number(food?.calories) || 0),
    0
  );

  const totalProtein = foods.reduce(
    (total, food) =>
      total + (Number(food?.protein) || 0),
    0
  );

  const totalCarbs = foods.reduce(
    (total, food) =>
      total + (Number(food?.carbs) || 0),
    0
  );

  const totalFats = foods.reduce(
    (total, food) =>
      total + (Number(food?.fats) || 0),
    0
  );

  return (
    <div className="nutrition-page">

      {/* ================= HEADER ================= */}

      <div className="nutrition-header">

        <div>

          <h1>
            Nutrition
          </h1>

          <p>
            Track your daily meals and nutritional intake.
          </p>

        </div>

        <button
          type="button"
          className="add-food-button"
          onClick={() => {
            setFormData(emptyForm);
            setEditingId(null);
            setShowForm(true);
            setError("");
          }}
        >
          <FaPlus />
          Add Food
        </button>

      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "10px",
            backgroundColor: "#fff1f2",
            color: "#b91c1c",
            border: "1px solid #fecdd3",
          }}
        >
          {error}
        </div>
      )}

      {/* ================= STATS ================= */}

      <div className="nutrition-stats">

        <div className="nutrition-stat-card">

          <div className="nutrition-stat-icon">
            <FaFire />
          </div>

          <div>

            <span>
              Calories
            </span>

            <strong>
              {totalCalories.toLocaleString()}
            </strong>

            <small>
              {" "}kcal
            </small>

          </div>

        </div>

        <div className="nutrition-stat-card">

          <div className="nutrition-stat-icon">
            <FaDrumstickBite />
          </div>

          <div>

            <span>
              Protein
            </span>

            <strong>
              {totalProtein}
            </strong>

            <small>
              {" "}g
            </small>

          </div>

        </div>

        <div className="nutrition-stat-card">

          <div className="nutrition-stat-icon">
            <FaBreadSlice />
          </div>

          <div>

            <span>
              Carbs
            </span>

            <strong>
              {totalCarbs}
            </strong>

            <small>
              {" "}g
            </small>

          </div>

        </div>

        <div className="nutrition-stat-card">

          <div className="nutrition-stat-icon">
            <FaUtensils />
          </div>

          <div>

            <span>
              Fats
            </span>

            <strong>
              {totalFats}
            </strong>

            <small>
              {" "}g
            </small>

          </div>

        </div>

      </div>

      {/* ================= TOOLBAR ================= */}

      <div className="nutrition-toolbar">

        <div className="nutrition-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search food..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <select
          className="nutrition-filter"
          value={mealFilter}
          onChange={(e) =>
            setMealFilter(e.target.value)
          }
        >

          <option value="All">
            All Meals
          </option>

          <option value="Breakfast">
            Breakfast
          </option>

          <option value="Lunch">
            Lunch
          </option>

          <option value="Dinner">
            Dinner
          </option>

          <option value="Snack">
            Snack
          </option>

        </select>

      </div>

      {/* ================= FORM ================= */}

      {showForm && (
        <div className="nutrition-form-card">

          <div className="nutrition-form-header">

            <div>

              <h3>
                {editingId
                  ? "Edit Food"
                  : "Add Food"}
              </h3>

              <p>
                Record your meal and nutritional values.
              </p>

            </div>

            <button
              type="button"
              className="close-nutrition-form"
              onClick={handleCancel}
            >
              <FaTimes />
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="nutrition-form-grid">

              <div className="nutrition-field">

                <label>
                  Food Name *
                </label>

                <input
                  type="text"
                  name="foodName"
                  placeholder="e.g. Grilled Chicken"
                  value={formData.foodName}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="nutrition-field">

                <label>
                  Meal Type
                </label>

                <select
                  name="mealType"
                  value={formData.mealType}
                  onChange={handleChange}
                >

                  <option value="Breakfast">
                    Breakfast
                  </option>

                  <option value="Lunch">
                    Lunch
                  </option>

                  <option value="Dinner">
                    Dinner
                  </option>

                  <option value="Snack">
                    Snack
                  </option>

                </select>

              </div>

              <div className="nutrition-field">

                <label>
                  Date *
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="nutrition-field">

                <label>
                  Quantity
                </label>

                <input
                  type="text"
                  name="quantity"
                  placeholder="e.g. 200g"
                  value={formData.quantity}
                  onChange={handleChange}
                />

              </div>

              <div className="nutrition-field">

                <label>
                  Calories (kcal)
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="350"
                  name="calories"
                  value={formData.calories}
                  onChange={handleChange}
                />

              </div>

              <div className="nutrition-field">

                <label>
                  Protein (g)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="35"
                  name="protein"
                  value={formData.protein}
                  onChange={handleChange}
                />

              </div>

              <div className="nutrition-field">

                <label>
                  Carbs (g)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="20"
                  name="carbs"
                  value={formData.carbs}
                  onChange={handleChange}
                />

              </div>

              <div className="nutrition-field">

                <label>
                  Fats (g)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="10"
                  name="fats"
                  value={formData.fats}
                  onChange={handleChange}
                />

              </div>

            </div>

            <div className="nutrition-form-actions">

              <button
                type="button"
                className="nutrition-cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="nutrition-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Food"
                  : "Save Food"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* ================= FOOD HISTORY ================= */}

      <div className="nutrition-card">

        <div className="nutrition-card-header">

          <div>

            <h3>
              Nutrition History
            </h3>

            <p>
              Your recorded meals and nutritional intake.
            </p>

          </div>

          <span className="nutrition-count">
            {filteredFoods.length} Records
          </span>

        </div>

        {loading ? (

          <div className="no-nutrition">

            <div className="no-nutrition-icon">
              <FaUtensils />
            </div>

            <h4>
              Loading nutrition records...
            </h4>

            <p>
              Please wait while your nutrition data is loaded.
            </p>

          </div>

        ) : filteredFoods.length === 0 ? (

          <div className="no-nutrition">

            <div className="no-nutrition-icon">
              <FaUtensils />
            </div>

            <h4>
              No nutrition records found
            </h4>

            <p>
              Start tracking your meals by adding your
              first food record.
            </p>

            <button
              type="button"
              onClick={() => {
                setFormData(emptyForm);
                setEditingId(null);
                setShowForm(true);
              }}
            >
              <FaPlus />
              Add Food
            </button>

          </div>

        ) : (

          <div className="nutrition-table-wrapper">

            <table className="nutrition-table">

              <thead>

                <tr>
                  <th>Food</th>
                  <th>Meal</th>
                  <th>Date</th>
                  <th>Quantity</th>
                  <th>Calories</th>
                  <th>Protein</th>
                  <th>Carbs</th>
                  <th>Fats</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredFoods.map((food) => {

                  const foodId = food._id;

                  const displayDate = food.date
                    ? new Date(food.date)
                        .toISOString()
                        .split("T")[0]
                    : "-";

                  return (
                    <tr key={foodId}>

                      <td>

                        <strong>
                          {food.foodName || "Food"}
                        </strong>

                      </td>

                      <td>

                        <span
                          className={`meal-badge ${
                            (
                              food.mealType ||
                              "Breakfast"
                            ).toLowerCase()
                          }`}
                        >
                          {food.mealType ||
                            "Breakfast"}
                        </span>

                      </td>

                      <td>
                        {displayDate}
                      </td>

                      <td>
                        {food.quantity || "-"}
                      </td>

                      <td>
                        {food.calories
                          ? `${food.calories} kcal`
                          : "-"}
                      </td>

                      <td>
                        {food.protein
                          ? `${food.protein}g`
                          : "-"}
                      </td>

                      <td>
                        {food.carbs
                          ? `${food.carbs}g`
                          : "-"}
                      </td>

                      <td>
                        {food.fats
                          ? `${food.fats}g`
                          : "-"}
                      </td>

                      <td>

                        <div className="nutrition-actions">

                          <button
                            type="button"
                            className="nutrition-edit"
                            onClick={() =>
                              handleEdit(food)
                            }
                            title="Edit"
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            className="nutrition-delete"
                            onClick={() =>
                              handleDelete(foodId)
                            }
                            title="Delete"
                          >
                            <FaTrash />
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Nutrition;
