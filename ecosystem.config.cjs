module.exports = {
  apps: [
    {
      name: "letsellr-backend",
      script: "./app.js",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};
