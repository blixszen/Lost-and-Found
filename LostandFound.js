let items = JSON.parse(localStorage.getItem("campusItems")) || [];

class FoundItem {
    constructor(id, name, category, location, description, reporter) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.location = location;
        this.description = description;
        this.reporter = reporter;
        this.date = new Date().toLocaleDateString();
        this.status = "Available";
    }
}

class LostFoundSystem {
    constructor() {
        this.items = items;
    }

    saveItems() {
        localStorage.setItem("campusItems", JSON.stringify(this.items));
    }

    addItem(name, category, location, description, reporter) {
        if (!name || !category || !location || !reporter) {
            alert("Please complete all required fields.");
            return;
        }

        const item = new FoundItem(
            Date.now(),
            name,
            category,
            location,
            description,
            reporter
        );

        this.items.unshift(item);
        this.saveItems();
        this.displayItems();
        alert("Found item added successfully.");
    }

    searchItems(keyword) {
        return this.items.filter(item =>
            item.name.toLowerCase().includes(keyword.toLowerCase()) ||
            item.category.toLowerCase().includes(keyword.toLowerCase()) ||
            item.location.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    filterItems(status) {
        if (status === "All") {
            return this.items;
        }

        return this.items.filter(item => item.status === status);
    }

    claimItem(id) {
        const item = this.items.find(item => item.id === Number(id));

        if (!item) {
            alert("Item not found.");
            return;
        }

        if (item.status === "Claimed") {
            alert("This item has already been claimed.");
            return;
        }

        item.status = "Claimed";
        this.saveItems();
        this.displayItems();
        alert("Item marked as claimed.");
    }

    deleteItem(id) {
        const exists = this.items.some(item => item.id === Number(id));

        if (!exists) {
            alert("Item not found.");
            return;
        }

        if (confirm("Are you sure you want to delete this item?")) {
            this.items = this.items.filter(item => item.id !== Number(id));
            items = this.items;
            this.saveItems();
            this.displayItems();
        }
    }

    getStatistics() {
        return {
            total: this.items.length,
            available: this.items.filter(item => item.status === "Available").length,
            claimed: this.items.filter(item => item.status === "Claimed").length
        };
    }

    displayItems(list = this.items) {
        const itemList = document.getElementById("itemList");

        if (!itemList) return;

        itemList.replaceChildren();

        list.forEach(item => {
            const article = document.createElement("article");
            const title = document.createElement("h3");
            title.textContent = item.name;

            const details = [
                `Category: ${item.category}`,
                `Location: ${item.location}`,
                `Description: ${item.description || "None"}`,
                `Reported by: ${item.reporter}`,
                `Date: ${item.date}`,
                `Status: ${item.status}`
            ];

            article.appendChild(title);

            details.forEach(detail => {
                const paragraph = document.createElement("p");
                paragraph.textContent = detail;
                article.appendChild(paragraph);
            });

            if (item.status === "Available") {
                const claimButton = document.createElement("button");
                claimButton.textContent = "Mark as Claimed";
                claimButton.addEventListener("click", () => this.claimItem(item.id));
                article.appendChild(claimButton);
            }

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => this.deleteItem(item.id));
            article.appendChild(deleteButton);

            itemList.appendChild(article);
        });

        this.updateDashboard();
    }

    updateDashboard() {
        const stats = this.getStatistics();

        const total = document.getElementById("total");
        const available = document.getElementById("available");
        const claimed = document.getElementById("claimed");

        if (total) total.textContent = stats.total;
        if (available) available.textContent = stats.available;
        if (claimed) claimed.textContent = stats.claimed;
    }
}

const system = new LostFoundSystem();

document.getElementById("itemForm")?.addEventListener("submit", function(event) {
    event.preventDefault();

    system.addItem(
        document.getElementById("itemName").value.trim(),
        document.getElementById("category").value,
        document.getElementById("location").value.trim(),
        document.getElementById("description").value.trim(),
        document.getElementById("reporter").value.trim()
    );

    this.reset();
});

document.getElementById("search")?.addEventListener("input", function() {
    system.displayItems(system.searchItems(this.value));
});

document.getElementById("filter")?.addEventListener("change", function() {
    const keyword = document.getElementById("search")?.value || "";
    const filtered = system.filterItems(this.value);

    system.displayItems(
        filtered.filter(item =>
            item.name.toLowerCase().includes(keyword.toLowerCase()) ||
            item.category.toLowerCase().includes(keyword.toLowerCase()) ||
            item.location.toLowerCase().includes(keyword.toLowerCase())
        )
    );
});

system.displayItems();