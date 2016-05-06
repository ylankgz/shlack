defmodule Shlack.Repo.Migrations.CreateTalks do
  use Ecto.Migration

  def change do
  	create table(:talks) do
      add :name, :citext
      add :moder_id, references(:users)

      timestamps
    end
    create unique_index(:talks, [:name])
  end
end
