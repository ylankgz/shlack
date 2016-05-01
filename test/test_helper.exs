ExUnit.start

Mix.Task.run "ecto.create", ~w(-r Shlack.Repo --quiet)
Mix.Task.run "ecto.migrate", ~w(-r Shlack.Repo --quiet)
Ecto.Adapters.SQL.begin_test_transaction(Shlack.Repo)

