<template>
  <div>
    <b-navbar class="navbar-custom shadow-sm" toggleable="lg">
      <b-navbar-brand to="/dashboard" href="#">Eigo</b-navbar-brand>
      <b-navbar-nav class="ml-auto">
        <router-link to="/study">Study</router-link>
        <router-link to="/learn">Learn</router-link>
        <router-link to="/words">Search</router-link>
        <b-nav-item-dropdown right>
          <!-- Using 'button-content' slot -->
          <template v-slot:button-content>
            <em>User</em>
          </template>
          <b-dropdown-item href="#" @click="this.$router.go('/profile')">Profile</b-dropdown-item>
          <b-dropdown-item to="/login" href="#" @click="gologout">Sign Out</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<script>
export default {
  name: "Navbar",
  methods: {
    gologout(e) {
      e.preventDefault();
      this.$http.post("http://localhost:3000/logout", {
        token: localStorage.getItem("jwt"),
      });
      localStorage.clear();
      this.$router.go("/login");
    },
  },
};
</script>

<style scoped>
.navbar-custom {
  background-color: #fbfbfb;
}

/* Modify brand and text color */
.navbar-custom .navbar-brand,
.navbar-custom .navbar-text {
  color: green;
}
</style>
