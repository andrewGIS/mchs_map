<template>
  <v-app toolbar>
    <v-app-bar app color="primary" dark>
      <!-- <div class="d-flex align-center"> -->
      <!-- <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"
          transition="scale-transition"
          width="40"
        />-->

      <v-toolbar-title class=".d-none .d-sm-flex">
        МОНИТОРИНГ ПРОХОЖДЕНИЯ ВЕСЕННЕГО
        <br />
        ПОЛОВОДЬЯ НА ТЕРРИТОРИИ ПК НА ВРЕМЕННЫХ ВОДОМЕРНЫХ ПОСТАХ
      </v-toolbar-title>
      <!-- </div> -->

      <v-spacer></v-spacer>

      <portal-target name="allStationButton">
        <!--
        This component can be located anywhere in your App.
        The slot content of the above portal component will be rendered here.
        -->
      </portal-target>
      <portal-target name="levelByButton">
        <!--
        This component can be located anywhere in your App.
        The slot content of the above portal component will be rendered here.
        -->
      </portal-target>
      <portal-target name="dynamicButton"></portal-target>
      <!-- <v-btn text>Request test data</v-btn> -->
      <!-- <v-btn  text
      >
        <span class="mr-2">Latest Release</span>
         <v-icon>mdi-open-in-new</v-icon> 
      </v-btn>-->
    </v-app-bar>

    <v-content>
      <vue-map></vue-map>
    </v-content>
  </v-app>
</template>

<script>
import VueMap from "./components/Map";

export default {
  name: "App",

  components: {
    VueMap
  },
  data() {
    return {
      //
    };
  }
};
</script>
<style>
html {
  overflow-y: hidden;
}
</style>
