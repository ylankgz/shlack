defmodule Shlack.Talk do
  use Shlack.Web, :model

  @derive {Poison.Encoder, only: [:id, :moder_id, :name]}

  schema "talks" do
    field :name, :string, unique: true
    belongs_to :moder, Shlack.User
 
    timestamps
  end

  @required_fields ~w(name)
  @optional_fields ~w(moder_id)

  @doc """
  Creates a changeset based on the `model` and `params`.

  If no params are provided, an invalid changeset is returned
  with no validation performed.
  """
  def changeset(model, params \\ :empty) do
    model
    |> cast(params, @required_fields, @optional_fields)
    |> foreign_key_constraint(:moder_id)
    |> unique_constraint(:name)
  end

  #Ecto query

  def public(query) do
    from(t in query,
      order_by: [desc: t.inserted_at])
  end
end