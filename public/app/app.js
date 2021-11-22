var _db;

var ingredCounter = 3;
var instructCounter = 3;
var currentRecipe;

function addIngred(e) {
  ingredCounter++;
  $(".ingredients").append(
    `<input id="ind${ingredCounter}" type="text" placeholder="Ingredient #${ingredCounter}" />`
  );
}

function addInstruct(e) {
  instructCounter++;
  $(".instructions").append(
    `<input id="ins${instructCounter}" type="text" placeholder="Instructions #${instructCounter}" />`
  );
}

var USER_RECIPES = [
  {
    recipeName: "Supreme Pizza",
    recipeDesc:
      "Make pizza night super duper out of this world with homemade pizza. This recipe is supreme with vegetables and two types of meat. Yum!",
    recipeImg: "recipe-pizza.jpg",
    recipeTime: "1h 24min",
    servingSize: "4 servings",
    ingredients: [
      "1/4 batch pizza dough",
      "2 tablespoons Last-Minute Pizza Sauce",
      "10 slices pepperoni",
      "1 cup cooked and crumbled Italian sausage",
      "2 large mushrooms, sliced",
      "1/4 bell pepper, sliced",
      "1 tablespoon sliced black olives",
      "1 cup shredded mozzarella cheese",
    ],
    instructions: [
      "1. Preheat the oven to 475°. Spray pizza pan with nonstick cooking or line a baking sheet with parchment paper.",
      "2. Flatten dough into a thin round and place on the pizza pan.",
      "3. Spread pizza sauce over the dough.",
      "4. Layer the toppings over the dough in the order listed .",
      "5. Bake for 8 to 10 minutes or until the crust is crisp and the cheese melted and lightly browned.",
    ],
  },
];

function initFirebase() {
  _db = firebase.firestore();

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log("user");
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var providerData = user.providerData;
      var uid = user.uid;

      $(".account").css("display", "block");
      $(".userless").css("display", "none");
    } else {
      console.log("logged out");
      $(".account").css("display", "none");
      $(".userless").css("display", "block");
    }
  });
}

function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Sign-out successful.
      window.location.href = "#/home";
    })
    .catch((error) => {
      // An error happened.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorMessage);
    });
}

function updateUser(disName) {
  firebase.auth().currentUser.updateProfile({
    displayName: disName,
  });
}

function login() {
  console.log("logging in");
  let email = $("#li--email").val();
  let password = $("#li--pw").val();

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      $("#li--email").val("");
      $("#li--pw").val("");
      // Signed in
      var user = userCredential.user;
      alert("Login Successful");
      window.location.href = "#/home";
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(errorMessage);
      console.log(errorMessage);
    });
}

function signup() {
  let fName = $("#fname").val();
  let lName = $("#lname").val();
  let email = $("#email").val();
  let password = $("#pw").val();

  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      let fullName = fName + " " + lName;
      updateUser(fullName);

      $("#fname").val("");
      $("#lname").val("");
      $("#email").val("");
      $("#pw").val("");
      // Signed in
      var user = userCredential.user;
      // ...
      console.log("account created");
      alert("Account Created");
      window.location.href = "#/home";
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      // ..
      alert(errorMessage);
      console.log(errorMessage);
    });
}

function route() {
  let hash = window.location.hash;
  let pgID = hash.replace("#/", "");

  if (pgID == "") {
    MODEL.pgChange("home", loadData);
  } else if (pgID == "view") {
    MODEL.pgChange(pgID, loadView);
  } else if (pgID == "edit") {
    MODEL.pgChange(pgID, editView);
  } else {
    MODEL.pgChange(pgID, loadData);
    // this will change the background depending on page
  }
}

function loadData(pgID) {
  if (pgID == "your") {
    document.getElementById("wrapper").className = "wrapper--recipes";
    $(".browse__container").empty();
    ingredCounter = 3;
    instructCounter = 3;
    let user = firebase.auth().currentUser;
    if (user) {
      $(".header p").html(`Hey ${user.displayName}, here are your Recipes!`);
      $.each(USER_RECIPES, function (index, recipe) {
        console.log(recipe.recipeImg);

        $(".browse__container").append(`
        <div class="item">
        <div class="recipe">
          
          <div class="recipe__img " 
          style="background-image: url(../images/${recipe.recipeImg});">
          <button class="userButton view" onclick="loadView(${index})">View</button>
          </div>
    
          <div class="recipe__info"> 
          <h3>${recipe.recipeName}</h3>
          <p>${recipe.recipeDesc}</p>
          <div class="recipeTime icon"><img src= "images/time.svg"/><p>${recipe.recipeTime}</p></div>
          <div class="recipeServe icon"><img src= "images/servings.svg"/><p>${recipe.servingSize}</p></div>
          </div>
          </div>
  
          <div class="options">
          <button class="userButton" onclick="editView(${index})">Edit Recipe</button>
          <button class="userButton" onclick="deleteItem(${index})">Delete</button>
          </div>
  
        </div>
          
          `);
      });
    } else {
      $(".header p").html(
        "We're sorry, but there was an error. Please re-login and try again"
      );
    }
  } else if (pgID == "view") {
    ingredCounter = 3;
    instructCounter = 3;
    document.getElementById("wrapper").className = "wrapper--" + pgID;

    let recipe = USER_RECIPES[currentRecipe];

    console.log(recipe);
    $(".recipeName").html(`${recipe.recipeName}`);

    $(".cover").append(`<div class="image-container" 
    style="background-image: url(../images/${recipe.recipeImg});">`);

    $(".recipeName").html(`<p>${recipe.recipeName}</p>`);

    $(".editContainer").html(
      `<button class="userButton" onclick="editView(${currentRecipe})">Edit Recipe</button>`
    );
    $(".text-container").html(`
      <h1>Description:</h1>
      <p>${recipe.recipeDesc}</p>

      <h5>Total Time:</h5>
      <p>${recipe.recipeTime}</p>

      <h5>Servings:</h5>
      <p>${recipe.servingSize}</p>
    `);

    $.each(recipe.ingredients, function (index, ingredient) {
      $(".ingredients__container").append(`<p>${ingredient}</p>`);
    });

    $.each(recipe.instructions, function (index, instruction) {
      $(".instructions__container").append(`<p>${instruction}</p>`);
    });

    // loads the data of the selected recipe to be edited
  } else if (pgID == "edit") {
    document.getElementById("wrapper").className = "wrapper--" + pgID;

    let user = firebase.auth().currentUser;

    $(".form-header").html(
      `<h4>Hey ${user.displayName}, edit your recipe!</h4>`
    );

    let recipe = USER_RECIPES[currentRecipe];
    console.log(recipe);
    $(".recipeName").val(`${recipe.recipeName}`);
    $(".recipeDesc").val(`${recipe.recipeDesc}`);
    $(".recipeTime").val(`${recipe.recipeTime}`);
    $(".recipeSize").val(`${recipe.servingSize}`);

    if (recipe.ingredients.length > 2) {
      console.log(recipe.ingredients.length);
      for (let i = 0; i < recipe.ingredients.length - 3; i++) {
        addIngred();
      }
    }

    $.each(recipe.ingredients, function (index, ingredient) {
      $(`#ind${index + 1}`).val(`${ingredient}`);
    });

    if (recipe.instructions.length > 2) {
      console.log(recipe.instructions.length);
      for (let i = 0; i < recipe.instructions.length - 3; i++) {
        addInstruct();
      }
    }

    $.each(recipe.instructions, function (index, instruction) {
      $(`#ins${index + 1}`).val(`${instruction}`);
    });

    $("#btnHolder").append(
      `<button class="formButton commit" onclick ="editRecipe(${currentRecipe})">Submit Changes</button>`
    );

    // This adds the proper title to the create recipe page
  } else if (pgID == "create") {
    document.getElementById("wrapper").className = "wrapper--" + pgID;
    let user = firebase.auth().currentUser;
    ingredCounter = 3;
    instructCounter = 3;

    $(".form-header").html(
      `<h4>Hey ${user.displayName}, create your recipe!</h4>`
    );
  } else {
    document.getElementById("wrapper").className = "wrapper--" + pgID;

    $.getJSON("data/data.json", function (recipes) {
      $(".browse__container").empty();

      $.each(recipes.PUBLIC_RECIPES, function (index, recipe) {
        $(".browse__container").append(`
        <div class="item">

        <div class="recipe">

        <div class="recipe__img" 
        style="background-image: url(../images/${recipe.recipeImg});">
        </div>
  
        <div class="recipe__info"> 
        <h3>${recipe.recipeName}</h3>
        <p>${recipe.recipeDesc}</p>
        <div class="recipeTime icon"><img src= "images/time.svg"/><p>${recipe.recipeTime}</p></div>
        <div class="recipeServe icon"><img src= "images/servings.svg"/><p>${recipe.servingSize}</p></div>
        </div>
        </div>
        `);
      });
    });
  }

  console.log(pgID);
}

function loadView(recipeId) {
  currentRecipe = recipeId;
  MODEL.pgChange("view", loadData);
}

function editView(recipeId) {
  currentRecipe = recipeId;
  MODEL.pgChange("edit", loadData);
}

function editRecipe(recipeId) {
  console.log("edited " + recipeId);
  let name = $(".recipeName").val();
  let desc = $(".recipeDesc").val();
  let time = $(".recipeTime").val();
  let size = $(".recipeSize").val();
  let img;
  if ($(".formImage").val() == "") {
    img = USER_RECIPES[recipeId].recipeImg;
  } else {
    img = $(".formImage").val() + ".jpg";
  }

  let ingredients = [];
  let instructions = [];

  for (i = 0; i < ingredCounter; i++) {
    console.log($(`#ind${i + 1}`).val());

    if ($(`#ind${i + 1}`).val() !== "") {
      ingredients.push($(`#ind${i + 1}`).val());
    }
  }

  for (i = 0; i < instructCounter; i++) {
    console.log($(`#ins${i + 1}`).val());
    if ($(`#ins${i + 1}`).val() !== "") {
      instructions.push($(`#ins${i + 1}`).val());
    }
  }

  let recipeObj = {
    recipeName: name,
    recipeDesc: desc,
    recipeImg: img,
    recipeTime: time,
    servingSize: size,
    ingredients: ingredients,
    instructions: instructions,
  };
  console.log(recipeObj);

  USER_RECIPES[recipeId] = recipeObj;
  ingredCounter = 3;
  instructCounter = 3;
  alert("Recipe Edited");
}

function deleteItem(recipeId) {
  USER_RECIPES.splice(recipeId, 1);
  MODEL.pgChange("your", loadData);
}

function createRecipe() {
  let name = $(".recipeName").val();
  let desc = $(".recipeDesc").val();
  let time = $(".recipeTime").val();
  let size = $(".recipeSize").val();
  let img = $(".formImage").val() + ".jpg";
  let ingredients = [];
  let instructions = [];

  for (i = 0; i < ingredCounter; i++) {
    console.log($(`#ind${i + 1}`).val());

    if ($(`#ind${i + 1}`).val() !== "") {
      ingredients.push($(`#ind${i + 1}`).val());
    }
  }

  for (i = 0; i < instructCounter; i++) {
    console.log($(`#ins${i + 1}`).val());
    if ($(`#ins${i + 1}`).val() !== "") {
      instructions.push($(`#ins${i + 1}`).val());
    }
  }

  let recipeObj = {
    recipeName: name,
    recipeDesc: desc,
    recipeImg: img,
    recipeTime: time,
    servingSize: size,
    ingredients: ingredients,
    instructions: instructions,
  };
  console.log(recipeObj);

  USER_RECIPES.push(recipeObj);
  ingredCounter = 3;
  instructCounter = 3;
  alert("Recipe Created");
}

function initListeners() {
  $(window).on("hashchange", route);
  route();

  $(".mobile").click(function (e) {
    gsap.to(".mobile-nav", {
      duration: 0.5,
      opacity: 1,
    });
    $(".mobile-nav").css("z-index", "1000");
    $(".mobile-nav").css("margin-top", "-90px");
  });

  $(".mobile-bg").click(function (e) {
    hideMenu();
  });

  $(".mobile-menu a").click(function (e) {
    hideMenu();
  });
}

function hideMenu() {
  gsap.to(".mobile-nav", {
    duration: 1,
    opacity: 0,
  });
  $(".mobile-nav").css("z-index", "0");
  $(".mobile-nav").css("margin-top", "0");
}

$("document").ready(function () {
  initFirebase();
  initListeners();
  gsap.set($(".mobile-nav"), { opacity: 0 });
});
