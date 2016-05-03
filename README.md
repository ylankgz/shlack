# Shlack
Little group chat app:

###### Walkthrough:
*[Part1](https://youtu.be/X6Z-sDSJ3sE)
*[Part2](https://youtu.be/MFRfM-Btxo0)

###### Prerequisites:
* Elixir: v1.0 or 1.2
* Phoenix: v1.1.4
* Nodejs: v5
* PostgreSQL: 9.4 or 9.5

###### Launch:
  * Clone this repo
  * Create file `dev.secret.exs` inside /config and paste this code: 
  ```elixir
    use Mix.Config
      config :ueberauth, Ueberauth,
        providers: [
            github: {Ueberauth.Strategy.Github, [uid_field: "login"]},
            google: {Ueberauth.Strategy.Google, []},
            facebook: {Ueberauth.Strategy.Facebook, [profile_fields: "email, name"]},
            identity: {Ueberauth.Strategy.Identity, [callback_methods: ["POST"]]},
        ]

      config :ueberauth, Ueberauth.Strategy.Github.OAuth,
        client_id: "GITHUB_CLIENT_ID",
        client_secret: "GITHUB_CLIENT_SECRET"
   ```
   where GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are credentials from your github oauth application
  * In terminal run: `mix deps.get`
  * Create and migrate your DB: `mix ecto.create && mix ecto.migrate`
  * Install Node.js dependencies with `npm install`
  * Start Phoenix endpoint with `iex -S mix phoenix.server`

Now you can visit [`lvh.me:4000`](http://lvh.me:4000) from your browser.

## Feedback
  
  * email: ylankgz@gmail.com
  * twitter: [@defoemark](https://twitter.com/defoemark)
