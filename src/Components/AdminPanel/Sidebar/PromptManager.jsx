import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PromptManager.css";

const PromptManager = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [prompts, setPrompts] = useState([]);
  const [newPrompt, setNewPrompt] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showAddPromptInput, setShowAddPromptInput] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    axios
      .get("http://localhost:5174/issue-categories")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((err) => {
        setAlertMessage("Error fetching categories");
        console.error(err);
      });
  }, []);

  // Fetch prompts for the selected category
  useEffect(() => {
    if (selectedCategory) {
      axios
        .get(`http://localhost:5174/api/categories/${selectedCategory}/prompts`)
        .then((response) => {
          const fetchedPrompts = response.data.prompts || [];
          setPrompts(fetchedPrompts);
          // Show input box if no prompts exist
          setShowAddPromptInput(fetchedPrompts.length === 0);
        })
        .catch((err) => {
          setAlertMessage("Error fetching prompts");
          console.error(err);
        });
    }
  }, [selectedCategory]);

  // Add a new prompt
  const handleAddPrompt = () => {
    if (newPrompt.trim()) {
      const updatedPrompts = [...prompts, newPrompt.trim()];
      
      axios
        .put(`http://localhost:5174/api/categories/${selectedCategory}/prompts`, {
          prompts: updatedPrompts,
        })
        .then(() => {
          setPrompts(updatedPrompts);
          setNewPrompt("");
          setShowAddPromptInput(false);
          setAlertMessage("Prompt saved successfully!");
        })
        .catch((err) => {
          setAlertMessage("Error saving prompt");
          console.error(err);
        });
    } else {
      setAlertMessage("Prompt cannot be empty.");
    }
  };

  // Delete a prompt
  const handleDeletePrompt = (promptToDelete) => {
    axios
      .delete(`http://localhost:5174/api/categories/${selectedCategory}/prompts`, {
        data: { prompt: promptToDelete }
      })
      .then(() => {
        const updatedPrompts = prompts.filter((prompt) => prompt !== promptToDelete);
        setPrompts(updatedPrompts);
        setAlertMessage("Prompt deleted successfully!");
        // Show input box if no prompts remain
        setShowAddPromptInput(updatedPrompts.length === 0);
      })
      .catch((err) => {
        setAlertMessage("Error deleting prompt");
        console.error(err);
      });
  };

  // Handle category selection
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setShowAddPromptInput(false);
  };

  // Show add prompt input when + icon is clicked
  const handleShowAddPromptInput = () => {
    setShowAddPromptInput(true);
  };

  return (
    <div className="prompt-manager flex flex-col items-center justify-center h-screen w-full p-6 border rounded-lg shadow-lg bg-white font-poppins">
      <h1 className="text-xl font-semibold mb-4">Issue Category Prompt Manager</h1>
      {alertMessage && <div className="alert text-red-500 mb-4">{alertMessage}</div>}

      {/* Dropdown to select issue category */}
      <div className="dropdown mb-4">
        <select
          onChange={handleCategoryChange}
          value={selectedCategory}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Display prompts and allow adding new ones */}
      {selectedCategory && (
        <div className="prompts-container w-1/2">
          <h2 className="text-lg font-semibold mb-4">Prompts for {selectedCategory}</h2>
          {prompts.map((prompt, index) => (
            <div key={index} className="prompt-item flex items-center mb-2">
              <input
                type="text"
                value={prompt}
                readOnly
                className="prompt-input w-full p-2 border border-gray-300 rounded-md mr-2"
              />
              {/* Delete icon for each prompt */}
              <button
                onClick={() => handleDeletePrompt(prompt)}
                className="delete-btn p-2 text-red-500 bg-buttoncolor"
              >
                <img src="https://cdn-icons-png.flaticon.com/128/3405/3405244.png" alt="" srcset="" className="h-6 w-6" />
              </button>
            </div>
          ))}

          {/* Show input box by default if no prompts exist */}
          {(prompts.length === 0 || showAddPromptInput) && (
            <div className="add-prompt flex flex-col items-center">
              <input
                type="text"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="Add new prompt"
                className="w-1/2 p-2 border border-gray-300 rounded-md mb-2"
              />
              {newPrompt.trim().length > 0 && (
                <button
                  onClick={handleAddPrompt}
                  className="submit-btn p-4 w-20 bg-buttoncolor text-white rounded-md"
                >
                  Submit
                </button>
              )}
            </div>
          )}

          {/* + Icon to add new input box when prompts exist */}
          {prompts.length > 0 && !showAddPromptInput && (
            <button
              onClick={handleShowAddPromptInput}
              className="add-btn p-2 text-green-500 text-5xl"
            >
              &#43;
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptManager;